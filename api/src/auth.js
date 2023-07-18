const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");

const { capture } = require("./sentry");
const config = require("./config");
const { sendTemplate, regexp_exception_staging } = require("./sendinblue");
const { COOKIE_MAX_AGE, JWT_MAX_AGE, TRUST_TOKEN_MAX_AGE, cookieOptions, logoutCookieOptions } = require("./cookie-options");
const { validatePassword, ERRORS, isYoung, STEPS2023, isReferent } = require("./utils");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { serializeYoung, serializeReferent } = require("./utils/serializer");
const { validateFirstName } = require("./utils/validator");
const { getFilteredSessions } = require("./utils/cohort");

class Auth {
  constructor(model) {
    this.model = model;
  }

  async signUp(req, res) {
    try {
      const { error, value } = Joi.object({
        email: Joi.string().lowercase().trim().email().required(),
        firstName: validateFirstName().trim().required(),
        lastName: Joi.string().uppercase().trim().required(),
        password: Joi.string().required(),
        birthdateAt: Joi.date().required(),
        frenchNationality: Joi.string().trim().required(),
        schooled: Joi.string().trim().required(),
        grade: Joi.string().trim().valid("NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"),
        schoolName: Joi.string().trim(),
        schoolType: Joi.string().trim(),
        schoolAddress: Joi.string().trim(),
        schoolZip: Joi.string().trim().allow(null, ""),
        schoolCity: Joi.string().trim(),
        schoolDepartment: Joi.string().trim(),
        schoolRegion: Joi.string().trim(),
        schoolCountry: Joi.string().trim(),
        schoolId: Joi.string().trim(),
        zip: Joi.string().trim(),
        cohort: Joi.string().trim().required(),
      }).validate(req.body);

      if (error) {
        if (error.details[0].path.find((e) => e === "email")) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
        if (error.details[0].path.find((e) => e === "password")) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const {
        email,
        firstName,
        lastName,
        password,
        birthdateAt,
        frenchNationality,
        schooled,
        schoolName,
        schoolType,
        schoolAddress,
        schoolZip,
        schoolCity,
        schoolDepartment,
        schoolRegion,
        schoolCountry,
        schoolId,
        zip,
        cohort,
        grade,
      } = value;
      if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

      const formatedDate = birthdateAt;
      formatedDate.setUTCHours(11, 0, 0);

      let countDocuments = await this.model.countDocuments({ lastName, firstName, birthdateAt: formatedDate });
      if (countDocuments > 0) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

      let sessions = await getFilteredSessions(value);
      if (config.ENVIRONMENT !== "production") sessions.push({ name: "à venir" });
      const session = sessions.find(({ name }) => name === value.cohort);
      if (!session) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

      const user = await this.model.create({
        email,
        firstName,
        lastName,
        password,
        birthdateAt: formatedDate,
        frenchNationality,
        schooled,
        schoolName,
        schoolType,
        schoolAddress,
        schoolZip,
        schoolCity,
        schoolDepartment,
        schoolRegion,
        schoolCountry,
        schoolId,
        zip,
        cohort,
        grade,
        inscriptionStep2023: STEPS2023.COORDONNEES,
        emailVerified: "false",
      });
      const token = jwt.sign({ _id: user.id, lastLogoutAt: null, passwordChangedAt: null }, config.secret, { expiresIn: JWT_MAX_AGE });
      if (isYoung(user)) res.cookie("jwt_young", token, cookieOptions());
      else if (isReferent(user)) res.cookie("jwt_ref", token, cookieOptions());

      await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED, {
        emailTo: [{ name: `${user.firstName} ${user.lastName}`, email: user.email }],
        params: {
          firstName: user.firstName,
          lastName: user.lastName,
          cta: `${config.APP_URL}/inscription2023?utm_campaign=transactionnel+compte+créé&utm_source=notifauto&utm_medium=mail+219+accéder`,
        },
      });

      return res.status(200).send({
        ok: true,
        token,
        user: serializeYoung(user, user),
      });
    } catch (error) {
      console.log("Error ", error);
      if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async signin(req, res) {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required(), password: Joi.string().required() }).unknown().validate(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.EMAIL_AND_PASSWORD_REQUIRED });

    const { password, email } = value;
    try {
      const now = new Date();
      const user = await this.model.findOne({ email, deletedAt: { $exists: false } });

      if (!user || user.status === "DELETED") return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });
      if (user.loginAttempts > 12) return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS" });
      if (user.nextLoginAttemptIn > now) return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: user.nextLoginAttemptIn } });

      const match = config.ENVIRONMENT === "development" || (await user.comparePassword(password));
      if (!match) {
        const loginAttempts = (user.loginAttempts || 0) + 1;

        let date = now;
        if (loginAttempts > 5) {
          date = new Date(now.getTime() + 60 * 1000);
        }

        user.set({ loginAttempts, nextLoginAttemptIn: date });
        await user.save();
        if (date > now) return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: date } });
        return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });
      }

      const shouldUse2FA = () => {
        if (config.ENVIRONMENT === "development") return false;
        if (config.ENVIRONMENT === "staging" && !user.email.match(regexp_exception_staging)) return false;

        if (user.emailVerified === "false") return false;

        const trustToken = req.cookies[`trust_token-${user._id}`];
        if (!trustToken) return true;
        const isKnownNavigator = jwt.verify(trustToken, config.secret);

        return !isKnownNavigator;
      };

      if (shouldUse2FA()) {
        const token2FA = await crypto.randomInt(1000000);
        user.set({ token2FA, attempts2FA: 0, token2FAExpires: Date.now() + 1000 * 60 * 10 });
        await user.save();

        await sendTemplate(SENDINBLUE_TEMPLATES.SIGNIN_2FA, {
          emailTo: [{ name: `${user.firstName} ${user.lastName}`, email }],
          params: { token2FA },
        });

        return res.status(200).send({
          ok: true,
          code: "2FA_REQUIRED",
        });
      }

      user.set({ loginAttempts: 0 });
      user.set({ lastLoginAt: Date.now(), lastActivityAt: Date.now() });
      await user.save();

      const token = jwt.sign({ _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.secret, { expiresIn: JWT_MAX_AGE });
      if (isYoung(user)) res.cookie("jwt_young", token, cookieOptions());
      else if (isReferent(user)) res.cookie("jwt_ref", token, cookieOptions());

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      return res.status(200).send({
        ok: true,
        token,
        user: data,
        data,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async signin2FA(req, res) {
    try {
      const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required(), token_2fa: Joi.string().required() }).unknown().validate(req.body);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      const { email, token_2fa } = value;
      const user = await this.model.findOne({
        email,
        attempts2FA: { $lt: 3 },
        token2FAExpires: { $gt: Date.now() },
      });
      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      if (user.token2FA !== token_2fa) {
        user.set({ attempts2FA: (user.attempts2FA || 0) + 1 });
        await user.save();
        return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      user.set({ token2FA: null, token2FAExpires: null });
      user.set({ loginAttempts: 0, attempts2FA: 0 });
      user.set({ lastLoginAt: Date.now(), lastActivityAt: Date.now() });
      await user.save();

      const trustToken = jwt.sign({}, config.secret, { expiresIn: TRUST_TOKEN_MAX_AGE });
      res.cookie(`trust_token-${user._id}`, trustToken, cookieOptions());

      const token = jwt.sign({ _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.secret, { expiresIn: JWT_MAX_AGE });
      if (isYoung(user)) res.cookie("jwt_young", token, cookieOptions());
      else if (isReferent(user)) res.cookie("jwt_ref", token, cookieOptions());

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      return res.status(200).send({
        ok: true,
        token,
        user: data,
        data,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async logout(req, res) {
    try {
      // Find user by token
      const { user } = req;
      user.set({ lastLogoutAt: Date.now() });
      await user.save();
      if (isYoung(user)) res.clearCookie("jwt_young", logoutCookieOptions());
      else if (isReferent(user)) res.clearCookie("jwt_ref", logoutCookieOptions());

      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false });
    }
  }

  async signinToken(req, res) {
    const { error, value } = Joi.object({ token_ref: Joi.string(), token_young: Joi.string() }).validate({ token_ref: req.cookies.jwt_ref, token_young: req.cookies.jwt_young });
    if (error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });

    try {
      const { user } = req;
      user.set({ lastActivityAt: Date.now() });
      await user.save();
      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      const token = isYoung(user) ? value.token_young : value.token_ref;
      if (!data || !token) throw Error("PB with signin_token");
      res.send({ ok: true, token: token, user: data, data });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async resetPassword(req, res) {
    const { error, value } = Joi.object({
      password: Joi.string().required(),
      newPassword: Joi.string().required(),
      verifyPassword: Joi.string().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { password, verifyPassword, newPassword } = value;

    if (!validatePassword(newPassword)) {
      return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
    }

    try {
      const match = await req.user.comparePassword(password);
      if (!match) return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_INVALID });
      if (newPassword !== verifyPassword) return res.status(422).send({ ok: false, code: ERRORS.PASSWORDS_NOT_MATCH });
      if (newPassword === password) return res.status(401).send({ ok: false, code: ERRORS.NEW_PASSWORD_IDENTICAL_PASSWORD });

      const user = await this.model.findById(req.user._id);
      const passwordChangedAt = Date.now();
      user.set({ password: newPassword, passwordChangedAt, loginAttempts: 0 });
      await user.save();

      const token = jwt.sign({ _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt }, config.secret, { expiresIn: JWT_MAX_AGE });
      if (isYoung(user)) res.cookie("jwt_young", token, cookieOptions());
      else if (isReferent(user)) res.cookie("jwt_ref", token, cookieOptions());

      return res.status(200).send({ ok: true, user: isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user) });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async forgotPassword(req, res, cta) {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required() }).unknown().validate(req.body);
    if (error) return res.status(404).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });

    const { email } = value;

    try {
      const user = await this.model.findOne({ email, deletedAt: { $exists: false } });
      if (!user) return res.status(200).send({ ok: true });

      const token = await crypto.randomBytes(20).toString("hex");
      user.set({ forgotPasswordResetToken: token, forgotPasswordResetExpires: Date.now() + COOKIE_MAX_AGE });
      await user.save();

      await sendTemplate(SENDINBLUE_TEMPLATES.FORGOT_PASSWORD, {
        emailTo: [{ name: `${user.firstName} ${user.lastName}`, email }],
        params: { cta: `${cta}?token=${token}` },
      });

      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async forgotPasswordReset(req, res) {
    const { error, value } = Joi.object({ password: Joi.string().required(), token: Joi.string().min(16).required() })
      .unknown()
      .validate(req.body);

    if (error) {
      if (error.details.find((e) => e.path === "password")) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
      return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
    }

    const { token, password } = value;
    if (!validatePassword(password)) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });

    try {
      const user = await this.model.findOne({
        forgotPasswordResetToken: token,
        forgotPasswordResetExpires: { $gt: Date.now() },
        deletedAt: { $exists: false },
      });
      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      const match = await user.comparePassword(password);
      if (match) return res.status(401).send({ ok: false, code: ERRORS.NEW_PASSWORD_IDENTICAL_PASSWORD });

      user.password = password;
      user.forgotPasswordResetToken = "";
      user.forgotPasswordResetExpires = "";
      user.passwordChangedAt = Date.now();
      user.loginAttempts = 0;
      await user.save();
      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }
}

module.exports = Auth;
