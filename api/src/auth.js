const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");

const { capture } = require("./sentry");

const config = require("./config");
const { sendEmail } = require("./sendinblue");
const { COOKIE_MAX_AGE, JWT_MAX_AGE, cookieOptions, logoutCookieOptions } = require("./cookie-options");
const { validatePassword, ERRORS } = require("./utils");
const { validateFirstName } = require("./utils/validator/default");
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

    if (error) return res.status(400).send({ ok: false, code: ERRORS.EMAIL_AND_PASSWORD_REQUIRED });

    const { password, email } = value;

    try {
      const user = await this.model.findOne({ email });

      if (!user) return res.status(401).send({ ok: false, code: ERRORS.USER_NOT_EXISTS });
      if (user.status === "DELETED") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const match = config.ENVIRONMENT === "development" || (await user.comparePassword(password));
      if (!match) return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });

      user.set({ lastLoginAt: Date.now() });
      await user.save();

      const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

      return res.status(200).send({ ok: true, token, user });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async signup(req, res) {
    try {
      const { error, value } = Joi.object({
        email: Joi.string().lowercase().trim().email().required(),
        firstName: validateFirstName().trim().required(),
        lastName: Joi.string().uppercase().trim().required(),
        password: Joi.string().required(),
      })
        .unknown()
        .validate(req.body);

      if (error) {
        if (error.details.find((e) => e.path === "email")) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
        if (error.details.find((e) => e.path === "password"))
          return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
        return res.status(400).send({ ok: false, code: error.toString() });
      }

      const { password, email, lastName, firstName } = value;
      if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

      const user = await this.model.create({ password, email, firstName, lastName });
      const token = jwt.sign({ _id: user._id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

      return res.status(200).send({ user, token, ok: true });
    } catch (error) {
      if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
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
      return res.status(500).send({ ok: false, error });
    }
  }

  async signinToken(req, res) {
    const { error, value } = Joi.object({
      token: Joi.string().required(),
    }).validate({ token: req.cookies.jwt });

    if (error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });

    try {
      const { user } = req;
      user.set({ lastLoginAt: Date.now() });
      await user.save();
      res.send({ user, token: value.token, ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async resetPassword(req, res) {
    const { password, verifyPassword, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
    }

    try {
      const match = await req.user.comparePassword(password);
      if (!match) return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_INVALID });
      if (newPassword !== verifyPassword) return res.status(422).send({ ok: false, code: ERRORS.PASSWORDS_NOT_MATCH });
      if (newPassword === password) return res.status(401).send({ ok: false, code: ERRORS.NEW_PASSWORD_IDENTICAL_PASSWORD });

      const obj = await this.model.findById(req.user._id);
      obj.set({ password: newPassword });
      await obj.save();

      return res.status(200).send({ ok: true, user: obj });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async forgotPassword(req, res, cta) {
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_EXISTS });

    const { email } = value;

    try {
      const obj = await this.model.findOne({ email });
      if (!obj) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_EXISTS });

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
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async forgotPasswordReset(req, res) {
    const { error, value } = Joi.object({
      password: Joi.string().required(),
      token: Joi.string().min(16).required(),
    })
      .unknown()
      .validate(req.body);

    if (error) {
      if (error.details.find((e) => e.path === "password")) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
      return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
    }

    const { token, password } = value;
    if (!validatePassword(password)) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });

    try {
      const obj = await this.model.findOne({
        forgotPasswordResetToken: token,
        forgotPasswordResetExpires: { $gt: Date.now() },
      });
      if (!obj) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      const match = await obj.comparePassword(password);
      if (match) return res.status(401).send({ ok: false, code: ERRORS.NEW_PASSWORD_IDENTICAL_PASSWORD });

      obj.password = password;
      obj.forgotPasswordResetToken = "";
      obj.forgotPasswordResetExpires = "";
      await obj.save();
      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }
}

module.exports = Auth;
