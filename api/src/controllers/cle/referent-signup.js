const express = require("express");
const router = express.Router();
const Joi = require("joi");
const crypto = require("crypto");
const { SENDINBLUE_TEMPLATES, ROLES, InvitationType, isReferentClasse, isCoordinateurEtablissement, isChefEtablissement } = require("snu-lib");

const emailsEmitter = require("../../emails");
const config = require("config");
const { capture } = require("../../sentry");
const { ERRORS, validatePassword } = require("../../utils");
const { sendTemplate } = require("../../brevo");
const { ReferentModel, EtablissementModel, ClasseModel } = require("../../models");
const { serializeReferent } = require("../../utils/serializer");

router.get("/token/:token", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      token: Joi.string().required(),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const referent = await ReferentModel.findOne({ invitationToken: value.token, invitationExpires: { $gt: Date.now() } });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let etablissement;
    if (isCoordinateurEtablissement(referent)) {
      etablissement = await EtablissementModel.findOne({ coordinateurIds: referent._id });
    } else if (isChefEtablissement(referent)) {
      etablissement = await EtablissementModel.findOne({ referentEtablissementIds: referent._id });
    } else if (referent.role === ROLES.REFERENT_CLASSE) {
      const classe = await ClasseModel.findOne({ referentClasseIds: referent._id });
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      etablissement = await EtablissementModel.findById(classe.etablissementId);
    }

    return res.status(200).send({ ok: true, data: { referent: serializeReferent(referent), etablissement, reinscription: !!referent.lastLoginAt } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/request-confirmation-email", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().trim().lowercase().email().required(),
      confirmEmail: Joi.string().trim().lowercase().email().required(),
      invitationToken: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    if (value.email !== value.confirmEmail) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, message: "L'email de confirmation n'est pas identique à l'email." });
    }

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const token2FA = await crypto.randomInt(1000000);
    referent.set({ emailWaitingValidation: value.email, token2FA, attempts2FA: 0, token2FAExpires: Date.now() + 1000 * 60 * 10 });
    await referent.save();

    let cta = `${config.ADMIN_URL}/creer-mon-compte/code?token=${value.invitationToken}&code=${token2FA}`;
    if (referent.lastLoginAt) {
      cta += "&reinscription=1";
    }

    await sendTemplate(SENDINBLUE_TEMPLATES.SIGNIN_2FA, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: value.email }],
      params: {
        token2FA,
        cta,
      },
    });

    return res.status(200).send({ ok: true, data: "2FA_REQUIRED" });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/confirm-email", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      code: Joi.string().required().trim(),
      invitationToken: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (referent.token2FA !== value.code) {
      referent.set({ attempts2FA: referent.attempts2FA + 1 });
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, message: "Le code est erronné." });
    }

    referent.set({
      email: referent.emailWaitingValidation,
      emailValidatedAt: Date.now(),
      emailWaitingValidation: null,
      token2FA: null,
      token2FAExpires: null,
      attempts2FA: 0,
    });
    await referent.save();

    return res.status(200).send({ ok: true, data: serializeReferent(referent) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/confirm-signup", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      invitationToken: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    //Check if user is already linked to an etablissement
    let etablissement;
    if (isCoordinateurEtablissement(referent)) {
      etablissement = await EtablissementModel.findOne({ coordinateurIds: referent._id });
    } else if (isChefEtablissement(referent)) {
      etablissement = await EtablissementModel.findOne({ referentEtablissementIds: referent._id });
    } else if (isReferentClasse(referent)) {
      const classe = await ClasseModel.findOne({ referentClasseIds: referent._id });
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      etablissement = await EtablissementModel.findById(classe.etablissementId);
    }
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Vous n'êtes lié à aucun établissement" });

    referent.set({ invitationToken: null, invitationExpires: null, acceptCGU: true, region: etablissement.region, department: etablissement.department });
    await referent.save({ fromUser: referent });

    if (isCoordinateurEtablissement(referent)) emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_COORDINATEUR, referent);
    else if (isChefEtablissement(referent)) {
      if (referent.metadata.invitationType === InvitationType.CONFIRMATION) {
        emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CONFIRM_REINSCRIPTION_REFERENT_ETABLISSEMENT, referent);
      } else {
        emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_REFERENT_ETABLISSEMENT, referent);
      }
    } else if (isReferentClasse(referent)) emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_REFERENT_CLASSE, referent);

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      // todo : check phone format
      phone: Joi.string(),
      password: Joi.string(),
      invitationToken: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const isReinscription = !!referent.lastLoginAt;
    if (!isReinscription && !validatePassword(value.password)) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
    if (!isReinscription) {
      referent.set({ password: value.password });
    }

    referent.set({
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phone,
      phoneZone: value.phoneZone,
    });
    await referent.save();

    return res.status(200).send({ ok: true, data: serializeReferent(referent) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
