const express = require("express");
const router = express.Router();
const Joi = require("joi");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { ROLES, SUB_ROLES, PHONE_ZONES_NAMES_ARR, SENDINBLUE_TEMPLATES } = require("snu-lib");

const { cookieOptions, JWT_MAX_AGE, COOKIE_MAX_AGE, TRUST_TOKEN_MAX_AGE } = require("../../cookie-options");

const config = require("../../config");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const ReferentModel = require("../../models/referent");
const AuthObject = require("../../auth");
const ReferentAuth = new AuthObject(ReferentModel);

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

    // We want to make sure the email is rightly provided by the user
    const token = jwt.sign({ _id: referent.id, lastLogoutAt: null, passwordChangedAt: null }, config.secret, { expiresIn: "30d" });
    res.cookie("jwt_ref", token, cookieOptions(COOKIE_MAX_AGE));

    delete referent.email;
    delete referent.firstName;
    delete referent.lastName;

    return res.status(200).send({ ok: true, data: referent, token });
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

    const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const token2FA = await crypto.randomInt(1000000);
    referent.set({ token2FA, attempts2FA: 0, token2FAExpires: Date.now() + 1000 * 60 * 10 });
    await referent.save();
    await sendTemplate(SENDINBLUE_TEMPLATES.SIGNIN_2FA, {
      emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: value.email }],
      params: {
        token2FA,
        cta: `${config.ADMIN_URL}/creer-mon-compte/code?token=${value.invitationToken}&code=${token2FA}`,
      },
    });

    return res.status(200).send({
      ok: true,
      code: "2FA_REQUIRED",
    });
  } catch (error) {}
});

router.post("/", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      etablissementId: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phone: Joi.string().required(),
      phoneZone: Joi.string().allow(PHONE_ZONES_NAMES_ARR).required(),
      role: Joi.string().allow([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE]).required(),
      subRole: Joi.string().allow([SUB_ROLES.referent_etablissement], [SUB_ROLES.coordinateur_cle]), // Optional when role is ROLES.REFERENT_CLASSE
      password: Joi.string().required(),
      invitationToken: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const referent = await ReferentModel.findOne({ email: value.email, role: value.role, subRole: value.subRole, invitationToken: value.token });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    referent.set({
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phone,
      phoneZone: value.phoneZone,
      password: value.password,
      invitationToken: null,
    });
    await referent.save();

    return ReferentAuth.signin(req, res);
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
