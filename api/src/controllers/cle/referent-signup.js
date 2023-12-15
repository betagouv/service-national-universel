const express = require("express");
const router = express.Router();
const Joi = require("joi");
const crypto = require("crypto");
const { SENDINBLUE_TEMPLATES, canUpdateEtablissement, ROLES, SUB_ROLES } = require("snu-lib");
const mongoose = require("mongoose");

const emailsEmitter = require("../../emails");
const config = require("../../config");
const { capture } = require("../../sentry");
const { ERRORS, validatePassword } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const ReferentModel = require("../../models/referent");
const SchoolRamsesModel = require("../../models/schoolRAMSES");
const EtablissementModel = require("../../models/cle/etablissement");
const ClasseModel = require("../../models/cle/classe");
const { serializeReferent } = require("../../utils/serializer");
const { validateEmailAcademique } = require("../../services/cle/referent");

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

    const referent = await ReferentModel.findOne({ invitationToken: value.token });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let etablissement;
    if (referent.subRole === SUB_ROLES.coordinateur_cle) {
      etablissement = await EtablissementModel.findOne({ coordinateurIds: referent._id });
    }
    if (referent.role === ROLES.REFERENT_CLASSE) {
      const classe = await ClasseModel.findOne({ referentClasseIds: referent._id });
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      etablissement = await EtablissementModel.findById(classe.etablissementId);
    }

    return res.status(200).send({ ok: true, data: { referent: serializeReferent(referent), etablissement } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/request-confirmation-email", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().email().required(),
      confirmEmail: Joi.string().email().required(),
      invitationToken: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    if (value.email !== value.confirmEmail)
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, message: "L'email de confirmation n'est pas identique à l'email." });

    if (config.ENVIRONMENT === "production" && !validateEmailAcademique(value.email))
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, message: "L'email doit être une adresse académique." });

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const token2FA = await crypto.randomInt(1000000);
    referent.set({ emailWaitingValidation: value.email, token2FA, attempts2FA: 0, token2FAExpires: Date.now() + 1000 * 60 * 10 });
    await referent.save();
    await sendTemplate(SENDINBLUE_TEMPLATES.SIGNIN_2FA, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: value.email }],
      params: {
        token2FA,
        cta: `${config.ADMIN_URL}/creer-mon-compte/code?token=${value.invitationToken}&code=${token2FA}`,
      },
    });

    return res.status(200).send({ ok: true, data: "2FA_REQUIRED" });
  } catch (error) { }
});

router.post("/confirm-email", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      code: Joi.string().required(),
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
  } catch (error) { }
});

router.post("/confirm-signup", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      invitationToken: Joi.string().required(),
      schoolId: Joi.string(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (value.schoolId) {
      if (!canUpdateEtablissement(referent)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const ramsesSchool = await SchoolRamsesModel.findById(value.schoolId);
      const body = {
        schoolId: value.schoolId,
        uai: ramsesSchool.uai,
        name: ramsesSchool.fullName,
        referentEtablissementIds: [referent._id.toString()],
        address: ramsesSchool.adresse,
        department: ramsesSchool.departmentName,
        region: ramsesSchool.region,
        zip: ramsesSchool.postcode,
        city: ramsesSchool.city,
        country: ramsesSchool.country,
      };

      await EtablissementModel.create([body]);
      referent.set({
        region: ramsesSchool.region,
        department: ramsesSchool.departmentName,
      });
    }

    referent.set({ invitationToken: null, acceptCGU: true });
    await referent.save({ fromUser: referent });

    if (referent.subRole === SUB_ROLES.coordinateur_cle) emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_COORDINATEUR, referent);
    else if (referent.subRole === SUB_ROLES.referent_etablissement) emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_REFERENT_ETABLISSEMENT, referent);
    else if (referent.role === ROLES.REFERENT_CLASSE) emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_REFERENT_CLASSE, referent);

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
      password: Joi.string().required(),
      invitationToken: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!validatePassword(value.password)) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    referent.set({
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phone,
      phoneZone: value.phoneZone,
      password: value.password,
    });
    await referent.save();

    return res.status(200).send({ ok: true, data: serializeReferent(referent) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
