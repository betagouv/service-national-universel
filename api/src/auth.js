const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");

const { capture } = require("./sentry");
const config = require("./config");
const { sendTemplate } = require("./sendinblue");
const { COOKIE_MAX_AGE, JWT_MAX_AGE, cookieOptions, logoutCookieOptions } = require("./cookie-options");
const { validatePassword, ERRORS, isYoung, STEPS2023 } = require("./utils");
const { getDepartmentByZip, SENDINBLUE_TEMPLATES } = require("snu-lib");
const { serializeYoung, serializeReferent } = require("./utils/serializer");
const { validateFirstName } = require("./utils/validator");
const InscriptionGoalModel = require("./models/inscriptionGoal");
const YoungModel = require("./models/young");

class Auth {
  constructor(model) {
    this.model = model;
  }

  async signUp(req, res) {
    try {
      // TODO: Check adress + date
      const { error, value } = Joi.object({
        email: Joi.string().lowercase().trim().email().required(),
        firstName: validateFirstName().trim().required(),
        lastName: Joi.string().uppercase().trim().required(),
        password: Joi.string().required(),
        birthdateAt: Joi.string().trim().required(),
        birthCountry: Joi.string().trim().required(),
        birthCity: Joi.string().trim().required(),
        birthCityZip: Joi.string().trim().allow(null, ""),
        rulesYoung: Joi.string().trim().required().valid("true"),
        acceptCGU: Joi.string().trim().required().valid("true"),
        frenchNationality: Joi.string().trim().required().valid("true"),
      }).validate(req.body);

      if (error) {
        if (error.details[0].path.find((e) => e === "email")) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
        if (error.details[0].path.find((e) => e === "password")) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const { email, firstName, lastName, password, birthdateAt, birthCountry, birthCity, birthCityZip, frenchNationality, acceptCGU, rulesYoung } = value;
      if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

      let countDocuments = await this.model.countDocuments({ lastName, firstName, birthdateAt });
      if (countDocuments > 0) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

      const user = await this.model.create({
        email,
        firstName,
        lastName,
        password,
        birthdateAt,
        birthCountry,
        birthCity,
        birthCityZip,
        frenchNationality,
        acceptCGU,
        rulesYoung,
      });
      const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

      return res.status(200).send({
        ok: true,
        token,
        user: serializeYoung(user, user),
      });
    } catch (error) {
      if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async signUp2023(req, res) {
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
        schoolZip: Joi.string().trim(),
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

      let countDocuments = await this.model.countDocuments({ lastName, firstName, birthdateAt });
      console.log("count = ", countDocuments, typeof countDocuments, countDocuments > 0);
      if (countDocuments > 0) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

      // Check inscription goals
      const dep = schoolDepartment || getDepartmentByZip(zip);
      const inscriptionGoal = await InscriptionGoalModel.findOne({ department: dep, cohort: cohort.name });
      if (inscriptionGoal && inscriptionGoal.max) {
        const nbYoung = await YoungModel.countDocuments({
          department: dep,
          cohort: cohort.name,
          status: { $nin: ["REFUSED", "NOT_ELIGIBLE", "WITHDRAWN", "DELETED"] },
        });
        if (nbYoung > 0) {
          const fillingRatio = nbYoung / Math.floor(inscriptionGoal.max * cohort.buffer);
          if (fillingRatio >= 1) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }

      const user = await this.model.create({
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
        inscriptionStep2023: STEPS2023.COORDONNEES,
      });
      const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

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
      const user = await this.model.findOne({ email });
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

      user.set({ loginAttempts: 0 });
      user.set({ lastLoginAt: Date.now() });
      await user.save();

      const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

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

  async logout(_req, res) {
    try {
      res.clearCookie("jwt", logoutCookieOptions());
      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false });
    }
  }

  async signinToken(req, res) {
    const { error, value } = Joi.object({ token: Joi.string().required() }).validate({ token: req.cookies.jwt });
    if (error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });

    try {
      const { user } = req;
      user.set({ lastLoginAt: Date.now() });
      await user.save();
      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      res.send({ ok: true, token: value.token, user: data, data });
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
      user.set({ password: newPassword });
      await user.save();

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
      const user = await this.model.findOne({ email });
      if (!user) return res.status(404).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });

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
      });
      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      const match = await user.comparePassword(password);
      if (match) return res.status(401).send({ ok: false, code: ERRORS.NEW_PASSWORD_IDENTICAL_PASSWORD });

      user.password = password;
      user.forgotPasswordResetToken = "";
      user.forgotPasswordResetExpires = "";
      await user.save();
      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }
}

module.exports = Auth;
