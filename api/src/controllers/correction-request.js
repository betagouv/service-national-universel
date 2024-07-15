/**
 * /correction-request
 *
 * ROUTES
 *   POST   /:youngId             -> create new requests.
 *   DELETE /:youngId/:field      -> cancel request for a field
 *   POST   /:youngId/remind      -> remind young if there are still SENT requests
 *   POST   /:youngId/remind-cni  -> remind parent1 for Invalid CNI honor certificate
 */

const express = require("express");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const { YoungModel } = require("../models");
const { capture } = require("../sentry");
const { serializeYoung } = require("../utils/serializer");
const { ERRORS, deleteFile } = require("../utils");
const passport = require("passport");
const { canUpdateYoungStatus, YOUNG_STATUS, SENDINBLUE_TEMPLATES } = require("snu-lib");
const { sendTemplate } = require("../brevo");
const config = require("config");

router.post("/:youngId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: youngId } = Joi.string().required().validate(req.params.youngId, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error, value: newRequests } = Joi.array()
      .items(
        Joi.object({
          cohort: Joi.string().trim().required(),
          field: Joi.string().required(),
          reason: Joi.string().allow(""),
          message: Joi.string().allow(""),
          status: Joi.string().valid("PENDING", "SENT", "REMINDED", "CORRECTED", "CANCELED").required(),
        }),
      )
      .validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const requests = young.correctionRequests ? young.correctionRequests : [];

    const sentAt = Date.now();
    for (const request of newRequests) {
      request.moderatorId = req.user._id;
      request.sentAt = sentAt;
      request.status = "SENT";

      // If unreadable/incorrect/other issue with id proof, delete it.
      if (request.field === "cniFile" && ["UNREADABLE", "OTHER", "NOT_SUITABLE"].includes(request.reason)) {
        for (const file of young.files.cniFiles) await deleteFile(`app/young/${young._id}/cniFiles/${file._id}`);
        young.set({ "files.cniFiles": [] });
      }

      const oldIndex = requests.findIndex((r) => r.field === request.field);
      if (oldIndex >= 0) {
        requests.splice(oldIndex, 1, request);
      } else {
        requests.push(request);
      }
    }

    if (!canUpdateYoungStatus({ body: { status: YOUNG_STATUS.WAITING_CORRECTION }, current: young })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ correctionRequests: requests, status: YOUNG_STATUS.WAITING_CORRECTION });
    await young.save({ fromUser: req.user });

    // --- send notifications for new corrections requests
    try {
      await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_CORRECTION, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: {
          cta: `${config.APP_URL}/`,
        },
      });
    } catch (e) {
      capture(e);
    }

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:youngId/:field", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_youngid, value: youngId } = Joi.string().required().validate(req.params.youngId, { stripUnknown: true });
    if (error_youngid) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, field: "youngId" });
    const { error: error_field, value: field } = Joi.string().required().trim().validate(req.params.field, { stripUnknown: true });
    if (error_field) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, field: "field" });

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let found = false;
    let stillWaitingCorrection = false;
    const requests = young.correctionRequests ? young.correctionRequests : [];

    for (const request of requests) {
      if (request.field === field) {
        found = true;
        request.moderatorId = req.user._id;
        request.status = "CANCELED";
        request.canceledAt = Date.now();
      } else {
        if (request.status === "SENT" || request.status === "REMINDED") {
          stillWaitingCorrection = true;
        }
      }
    }

    if (found) {
      let status = young.status;
      if (!stillWaitingCorrection && status === YOUNG_STATUS.WAITING_CORRECTION) {
        if (!canUpdateYoungStatus({ body: { status: YOUNG_STATUS.WAITING_VALIDATION }, current: young })) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        }
        status = YOUNG_STATUS.WAITING_VALIDATION;
      }

      young.set({ correctionRequests: requests, status });
      await young.save({ fromUser: req.user });

      return res.status(200).send({ ok: true, data: serializeYoung(young) });
    } else {
      return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:youngId/remind", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_youngid, value: youngId } = Joi.string().required().validate(req.params.youngId, { stripUnknown: true });
    if (error_youngid) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, field: "youngId" });

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let found = false;
    const requests = young.correctionRequests ? young.correctionRequests : [];

    for (const request of requests) {
      found = true;
      request.moderatorId = req.user._id;
      request.status = "REMINDED";
      request.remindedAt = Date.now();
    }

    if (found) {
      young.set({ correctionRequests: requests });
      await young.save({ fromUser: req.user });

      // --- send notifications for corrections requests reminder
      try {
        await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_REMIND_CORRECTION, {
          emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
          params: {
            cta: `${config.APP_URL}/`,
          },
        });
      } catch (e) {
        capture(e);
      }

      return res.status(200).send({ ok: true, data: serializeYoung(young) });
    } else {
      return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:youngId/remind-cni", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_youngid, value: youngId } = Joi.string().required().validate(req.params.youngId, { stripUnknown: true });
    if (error_youngid) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, field: "youngId" });

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await sendTemplate(SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF, {
      emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
      params: {
        cta: `${config.APP_URL}/representants-legaux/cni-invalide?token=${young.parent1Inscription2023Token}&utm_campaign=transactionnel+replegal+ID+perimee&utm_source=notifauto&utm_medium=mail+610+effectuer`,
        youngFirstName: young.firstName,
        youngName: young.lastName,
      },
    });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
