const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const { canEditPresenceYoung } = require("snu-lib/roles");
const { SENDINBLUE_TEMPLATES } = require("snu-lib/constants");

const { capture } = require("../../sentry");
const YoungModel = require("../../models/young");
const SessionPhase1Model = require("../../models/sessionPhase1");
const { ERRORS, autoValidationSessionPhase1Young } = require("../../utils");
const { serializeYoung } = require("../../utils/serializer");
const { sendTemplate } = require("../../sendinblue");

router.post("/depart", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      departSejourMotif: Joi.string().required(),
      departSejourAt: Joi.string().required(),
      departSejourMotifComment: Joi.string().optional().allow(null, ""),
      id: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const { departSejourMotif, departSejourAt, departSejourMotifComment, id } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ departSejourAt, departSejourMotif, departSejourMotifComment, departInform: "true" });
    await young.save({ fromUser: req.user });

    const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
    await autoValidationSessionPhase1Young({ young, sessionPhase1, req });

    res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/depart", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate({ ...req.params });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    young.set({ departSejourAt: undefined, departSejourMotif: undefined, departSejourMotifComment: undefined, departInform: undefined });
    await young.save({ fromUser: req.user });

    const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
    await autoValidationSessionPhase1Young({ young, sessionPhase1, req });

    res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:key", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const allowedKeys = ["cohesionStayPresence", "presenceJDM", "cohesionStayMedicalFileReceived"];
    const { error, value } = Joi.object({
      value: Joi.string().trim().valid("true", "false").required(),
      key: Joi.string()
        .trim()
        .required()
        .valid(...allowedKeys),
      id: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const { value: newValue, key, id } = value;

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

    if (!canEditPresenceYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if ((key === "cohesionStayPresence" && newValue === "false") || (key === "presenceJDM" && young.cohesionStayPresence === "false")) {
      young.set({ cohesionStayPresence: "false", presenceJDM: "false" });
    } else {
      young.set({ [key]: newValue });
    }

    await young.save({ fromUser: req.user });

    const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
    await autoValidationSessionPhase1Young({ young, sessionPhase1, req });

    if (key === "cohesionStayPresence" && newValue === "true") {
      let emailTo = [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }];
      if (young.parent2Email) emailTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
      await sendTemplate(SENDINBLUE_TEMPLATES.YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL, {
        emailTo,
        params: {
          youngFirstName: young.firstName,
          youngLastName: young.lastName,
        },
      });
    }

    res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
