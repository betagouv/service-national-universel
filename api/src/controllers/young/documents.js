const express = require("express");
const passport = require("passport");
const Joi = require("joi");
const fetch = require("node-fetch");
const router = express.Router({ mergeParams: true });
const { capture } = require("../../sentry");
const YoungObject = require("../../models/young");
const ContractObject = require("../../models/contract");
const { ERRORS, isYoung, isReferent, getCcOfYoung, timeout } = require("../../utils");
const certificate = require("../../templates/certificate");
const form = require("../../templates/form");
const convocation = require("../../templates/convocation");
const contractPhase2 = require("../../templates/contractPhase2");
const { sendTemplate, sendEmail } = require("../../sendinblue");
const { canSendFileByMail, canDownloadYoungDocuments } = require("snu-lib/roles");
const { SENDINBLUE_TEMPLATES } = require("snu-lib/constants");
const config = require("../../config");

async function getHtmlTemplate(type, template, young, contract) {
  if (type === "certificate" && template === "1") return await certificate.phase1(young);
  if (type === "certificate" && template === "2") return certificate.phase2(young);
  if (type === "certificate" && template === "3") return certificate.phase3(young);
  if (type === "certificate" && template === "snu") return certificate.snu(young);
  if (type === "form" && template === "imageRight") return form.imageRight(young);
  if (type === "form" && template === "autotestPCR") return form.autotestPCR(young);
  if (type === "convocation" && template === "cohesion") return convocation.cohesion(young);
  if (type === "contract" && template === "2" && contract) return contractPhase2.render(contract);
}

function getMailParams(type, template, young, contract) {
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
  if (type === "contract" && template === "2" && contract)
    return {
      object: `Contrat de la mission ${contract.missionName}`,
      message: `Vous trouverez en pièce-jointe de ce mail le contract de la mission ${contract.missionName}.`,
    };
  if (type === "convocation" && template === "cohesion") {
    return {
      object: `Convocation au séjour de cohésion de ${young.firstName} ${young.lastName}`,
      message: "Vous trouverez en pièce-jointe de ce mail votre convocation au séjour de cohésion à présenter à votre arrivée au point de rassemblement.",
    };
  }

  //todo: add other templates
  // if (type === "form" && template === "imageRight") return { object: "", message: "" };
  // if (type === "form" && template === "autotestPCR") return { object: "", message: "" };
  // if (type === "convocation" && template === "cohesion") return { object: "", message: "" };
}

const TIMEOUT_PDF_SERVICE = 15000;
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
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // Create html
    const html = await getHtmlTemplate(type, template, young);
    if (!html) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const getPDF = async () =>
      await fetch(config.API_PDF_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/pdf" },
        body: JSON.stringify({ html, options: type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 } }),
      }).then((response) => {
        // ! On a retravaillé pour faire passer les tests
        if (response.status && response.status !== 200) throw new Error("Error with PDF service");
        res.set({
          "content-length": response.headers.get("content-length"),
          "content-disposition": `inline; filename="test.pdf"`,
          "content-type": "application/pdf",
          "cache-control": "public, max-age=1",
        });
        response.body.pipe(res);
        if (res.statusCode !== 200) throw new Error("Error with PDF service");
        response.body.on("error", (e) => {
          capture(e);
          res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
        });
      });
    try {
      await timeout(getPDF(), TIMEOUT_PDF_SERVICE);
    } catch (e) {
      res.status(500).send({ ok: false, code: ERRORS.PDF_ERROR });
      capture(e);
    }
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// todo: refacto
router.post("/:type/:template/send-email", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      type: Joi.string().required(),
      template: Joi.string().required(),
      contract_id: Joi.string(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body, ...req.query }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id, type, template, fileName, contract_id } = value;

    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only send to them their own documents.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    if (isReferent(req.user) && !canSendFileByMail(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let contract;
    if (type === "contract") {
      if (!contract_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      contract = await ContractObject.findById(contract_id);
      if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // Create html
    const html = await getHtmlTemplate(type, template, young, contract);
    if (!html) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const { object, message } = getMailParams(type, template, young, contract);

    const getPDF = async () =>
      await fetch(config.API_PDF_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/pdf" },
        body: JSON.stringify({ html, options: type === "certificate" ? { landscape: true } : { format: "A4", margin: 0 } }),
      }).then((response) => {
        if (response.status !== 200) throw new Error("Error with PDF service");
        return response.buffer();
      });

    let buffer;
    try {
      buffer = await timeout(getPDF(), TIMEOUT_PDF_SERVICE);
    } catch (e) {
      res.status(500).send({ ok: false, code: ERRORS.PDF_ERROR });
      capture(e);
    }

    const content = buffer.toString("base64");

    let emailTemplate = SENDINBLUE_TEMPLATES.young.DOCUMENT;
    let cc = getCcOfYoung({ template: emailTemplate, young });

    const mail = await sendTemplate(emailTemplate, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      attachment: [{ content, name: fileName }],
      params: { object, message },
      cc,
    });
    res.status(200).send({ ok: true, data: mail });
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, e, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
