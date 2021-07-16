const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");

const { capture } = require("./sentry");

const config = require("./config");
const { sendEmail } = require("./sendinblue");
const { COOKIE_MAX_AGE, JWT_MAX_AGE, cookieOptions, logoutCookieOptions } = require("./cookie-options");
const { validatePassword } = require("./utils");

const EMAIL_OR_PASSWORD_INVALID = "EMAIL_OR_PASSWORD_INVALID";
const PASSWORD_INVALID = "PASSWORD_INVALID";
const EMAIL_INVALID = "EMAIL_INVALID";
const EMAIL_AND_PASSWORD_REQUIRED = "EMAIL_AND_PASSWORD_REQUIRED";
const PASSWORD_TOKEN_EXPIRED_OR_INVALID = "PASSWORD_TOKEN_EXPIRED_OR_INVALID";
const PASSWORDS_NOT_MATCH = "PASSWORDS_NOT_MATCH";
const SERVER_ERROR = "SERVER_ERROR";
const USER_ALREADY_REGISTERED = "USER_ALREADY_REGISTERED";
const PASSWORD_NOT_VALIDATED = "PASSWORD_NOT_VALIDATED";
const USER_NOT_EXISTS = "USER_NOT_EXISTS";
const OPERATION_UNAUTHORIZED = "OPERATION_UNAUTHORIZED";
class Auth {
  constructor(model) {
    this.model = model;
  }

  async signin(req, res) {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      password: Joi.string().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: EMAIL_AND_PASSWORD_REQUIRED });

    const { password, email } = value;

    try {
      const user = await this.model.findOne({ email });

      if (!user) return res.status(401).send({ ok: false, code: USER_NOT_EXISTS });
      if (user.status === "DELETED") return res.status(401).send({ ok: false, code: OPERATION_UNAUTHORIZED });

      const match = config.ENVIRONMENT === "development" || (await user.comparePassword(password));
      if (!match) return res.status(401).send({ ok: false, code: EMAIL_OR_PASSWORD_INVALID });

      user.set({ lastLoginAt: Date.now() });
      await user.save();

      const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

      return res.status(200).send({ ok: true, token, user });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }

  async signup(req, res) {
    try {
      const { error, value } = Joi.object({
        email: Joi.string().lowercase().trim().email().required(),
        firstName: Joi.string().lowercase().trim().required(),
        lastName: Joi.string().uppercase().trim().required(),
        password: Joi.string().required(),
      })
        .unknown()
        .validate(req.body);

      if (error) {
        if (error.details.find((e) => e.path === "email")) return res.status(400).send({ ok: false, user: null, code: EMAIL_INVALID });
        if (error.details.find((e) => e.path === "password")) return res.status(400).send({ ok: false, user: null, code: PASSWORD_NOT_VALIDATED });
        return res.status(400).send({ ok: false, code: error.toString() });
      }

      if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: PASSWORD_NOT_VALIDATED });

      const { password, email, lastName } = value;
      const firstName = value.firstName.charAt(0).toUpperCase() + value.firstName.toLowerCase().slice(1);

      const user = await this.model.create({ password, email, firstName, lastName });
      const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

      return res.status(200).send({ user, token, ok: true });
    } catch (error) {
      if (error.code === 11000) return res.status(409).send({ ok: false, code: USER_ALREADY_REGISTERED });
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }

  async logout(_req, res) {
    try {
      res.clearCookie("jwt", logoutCookieOptions());
      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, error });
    }
  }

  async signinToken(req, res) {
    const { error, value } = Joi.object({
      token: Joi.string().required(),
    }).validate({ token: req.cookies.jwt });

    if (error) return res.status(500).send({ ok: false, code: SERVER_ERROR });

    try {
      const { user } = req;
      user.set({ lastLoginAt: Date.now() });
      await user.save();
      res.send({ user, token: value.token, ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }

  async resetPassword(req, res) {
    const { error, value } = Joi.object({
      password: Joi.string().min(8).required(),
      newPassword: Joi.string().min(8).required(),
      verifyPassword: Joi.string().min(8).required(),
    })
      .unknown()
      .validate(req.body);

    if (error) res.status(400).send({ ok: false, code: PASSWORD_NOT_VALIDATED });

    const { password, verifyPassword, newPassword } = value;

    try {
      const match = await req.user.comparePassword(password);
      if (!match) {
        return res.status(401).send({ ok: false, code: PASSWORD_INVALID });
      }
      if (newPassword !== verifyPassword) {
        return res.status(422).send({ ok: false, code: PASSWORDS_NOT_MATCH });
      }

      const obj = await this.model.findById(req.user._id);
      obj.set({ password: newPassword });
      await obj.save();

      return res.status(200).send({ ok: true, user: obj });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }

  async forgotPassword(req, res, cta) {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) return res.status(404).send({ ok: false, code: USER_NOT_EXISTS });

    const { email } = value;

    try {
      const obj = await this.model.findOne({ email });
      if (!obj) return res.status(404).send({ ok: false, code: USER_NOT_EXISTS });

      const token = await crypto.randomBytes(20).toString("hex");
      obj.set({ forgotPasswordResetToken: token, forgotPasswordResetExpires: Date.now() + COOKIE_MAX_AGE });
      await obj.save();

      const htmlContent = fs
        .readFileSync(path.resolve(__dirname, "./templates/forgetpassword.html"))
        .toString()
        .replace(/{{cta}}/g, `${cta}?token=${token}`);
      await sendEmail({ name: `${obj.firstName} ${obj.lastName}`, email }, "Réinitialiser mon mot de passe", htmlContent);

      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }

  async forgotPasswordReset(req, res) {
    const { error, value } = Joi.object({
      password: Joi.string().min(8).required(),
      token: Joi.string().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) {
      if (error.details.find((e) => e.path === "password")) return res.status(400).send({ ok: false, code: PASSWORD_NOT_VALIDATED });
      return res.status(400).send({ ok: false, code: PASSWORD_TOKEN_EXPIRED_OR_INVALID });
    }

    const { token, password } = value;

    try {
      const obj = await this.model.findOne({
        forgotPasswordResetToken: token,
        forgotPasswordResetExpires: { $gt: Date.now() },
      });
      if (!obj) return res.status(400).send({ ok: false, code: PASSWORD_TOKEN_EXPIRED_OR_INVALID });

      obj.password = password;
      obj.forgotPasswordResetToken = "";
      obj.forgotPasswordResetExpires = "";
      await obj.save();
      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }
}

module.exports = Auth;
