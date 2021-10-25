const express = require("express");
const passport = require("passport");
const Joi = require("joi");
const router = express.Router({ mergeParams: true });
const { capture } = require("../../sentry");
const renderFromHtml = require("../../htmlToPdf");
const YoungObject = require("../../models/young");
const ContractObject = require("../../models/contract");
const { ERRORS, isYoung, isReferent } = require("../../utils");
const certificate = require("../../templates/certificate");
const form = require("../../templates/form");
const convocation = require("../../templates/convocation");
const contractPhase2 = require("../../templates/contractPhase2");
const { sendTemplate } = require("../../sendinblue");
const { canSendFileByMail } = require("snu-lib/roles");
const { SENDINBLUE_TEMPLATES } = require("snu-lib/constants");

function getHtmlTemplate(type, template, young, contract = undefined) {
  if (type === "certificate" && template === "1") return certificate.phase1(young);
  if (type === "certificate" && template === "2") return certificate.phase2(young);
  if (type === "certificate" && template === "3") return certificate.phase3(young);
  if (type === "certificate" && template === "snu") return certificate.snu(young);
  if (type === "form" && template === "imageRight") return form.imageRight(young);
  if (type === "form" && template === "autotestPCR") return form.autotestPCR(young);
  if (type === "convocation" && template === "cohesion") return convocation.cohesion(young);
  if (type === "contract" && template === "2") return contractPhase2.render(contract);
}

function getMailParams(type, template, young, contract = undefined) {
  if (type === "certificate" && template === "1")
    return {
      object: `Attestation de fin de phase 1 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 1 du SNU.`,
    };
  if (type === "certificate" && template === "2")
    return {
      object: `Attestation de fin de phase 2 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 2 du SNU.`,
    };
  if (type === "certificate" && template === "3")
    return {
      object: `Attestation de fin de phase 3 de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation de phase 3 du SNU.`,
    };
  if (type === "certificate" && template === "snu")
    return {
      object: `Attestation de réalisation du SNU de ${young.firstName}`,
      message: `Vous trouverez en pièce-jointe de ce mail l'attestation de réalisation du SNU.`,
    };
  if (type === "contract" && template === "2")
    return {
      object: `Contrat de la mission ${contract.missionName}`,
      message: `Vous trouverez en pièce-jointe de ce mail le contract de la mission ${contract.missionName}.`,
    };

  //todo: add other templates
  // if (type === "form" && template === "imageRight") return { object: "", message: "" };
  // if (type === "form" && template === "autotestPCR") return { object: "", message: "" };
  // if (type === "convocation" && template === "cohesion") return { object: "", message: "" };
}

router.post("/:type/:template", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required(), type: Joi.string().required(), template: Joi.string().required() })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id, type, template } = value;

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only download their own documents.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // Create html
    const html = await getHtmlTemplate(type, template, young);
    if (!html) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const buffer = await renderFromHtml(html, type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 });
    res.contentType("application/pdf");
    res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(buffer);
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, e, code: ERRORS.SERVER_ERROR });
  }
});
router.post(
  "/:type/:template/send-email",
  passport.authenticate(["young", "referent"], { session: false, failWithError: true }),
  async (req, res) => {
    try {
      const { error, value } = Joi.object({ id: Joi.string().required(), type: Joi.string().required(), template: Joi.string().required() })
        .unknown()
        .validate({ ...req.params, ...req.body }, { stripUnknown: true });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      const { id, type, template, fileName } = value;

      const young = await YoungObject.findById(id);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // A young can only send to them their own documents.
      if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
        return res.status(401).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      if (isReferent(req.user) && !canSendFileByMail(req.user, young)) {
        return res.status(401).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      if (type === "contract") {
        const contract_id = req.query.contract_id;
        if (!contract_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

        contract = await ContractObject.findById(contract_id);
        if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      // Create html
      const html = await getHtmlTemplate(type, template, young, contract);
      if (!html) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const { object, message } = getMailParams(type, template, young, contract);

      const buffer = await renderFromHtml(html, type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 });
      const content = buffer.toString("base64");

      const mail = await sendTemplate(SENDINBLUE_TEMPLATES.young.DOCUMENT, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        attachment: [{ content, name: fileName }],
        params: { object, message },
      });
      res.status(200).send({ ok: true, data: mail });
    } catch (e) {
      capture(e);
      res.status(500).send({ ok: false, e, code: ERRORS.SERVER_ERROR });
    }
  }
);

module.exports = router;
