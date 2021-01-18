const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const validator = require("validator");

const { capture } = require("./sentry");

const config = require("./config");
const { validatePassword } = require("./utils");
const { sendEmail } = require("./sendinblue");

const EMAIL_OR_PASSWORD_INVALID = "EMAIL_OR_PASSWORD_INVALID";
const PASSWORD_INVALID = "PASSWORD_INVALID";
const EMAIL_INVALID = "EMAIL_INVALID";
const EMAIL_AND_PASSWORD_REQUIRED = "EMAIL_AND_PASSWORD_REQUIRED";
const PASSWORD_TOKEN_EXPIRED_OR_INVALID = "PASSWORD_TOKEN_EXPIRED_OR_INVALID";
const PASSWORDS_NOT_MATCH = "PASSWORDS_NOT_MATCH";
const SERVER_ERROR = "SERVER_ERROR";
const USER_ALREADY_REGISTERED = "USER_ALREADY_REGISTERED";
const PASSWORD_NOT_VALIDATED = "PASSWORD_NOT_VALIDATED";
const ACOUNT_NOT_ACTIVATED = "ACOUNT_NOT_ACTIVATED";
const USER_NOT_EXISTS = "USER_NOT_EXISTS";

const COOKIE_MAX_AGE = 60 * 60 * 2 * 1000; // 2h
const JWT_MAX_AGE = 60 * 60 * 2; // 2h

function cookieOptions() {
  if (config.ENVIRONMENT === "development") {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: false };
  } else {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: true, sameSite: "none" };
  }
}
class Auth {
  constructor(model) {
    this.model = model;
  }

  async signin(req, res) {
    let { password, email } = req.body;
    email = (email || "").trim().toLowerCase();

    if (!email || !password) return res.status(400).send({ ok: false, code: EMAIL_AND_PASSWORD_REQUIRED });

    try {
      const user = await this.model.findOne({ email });
      if (!user) return res.status(401).send({ ok: false, code: USER_NOT_EXISTS });

      // simplify
      const match = await user.comparePassword(password);
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
      const { password, email: reqEmail, firstName: reqFirstName, lastName: reqLastName } = req.body;

      if (!validatePassword(password)) return res.status(200).send({ ok: false, user: null, code: PASSWORD_NOT_VALIDATED });

      const email = reqEmail.trim().toLowerCase();
      if (!validator.isEmail(email)) return res.status(200).send({ ok: false, user: null, code: EMAIL_INVALID });

      const firstName = reqFirstName.charAt(0).toUpperCase() + (reqFirstName || "").toLowerCase().slice(1);
      const lastName = reqLastName.toUpperCase();
      const email = reqEmail.trim().toLowerCase();

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

  async logout(req, res) {
    try {
      res.clearCookie("jwt");
      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, error });
    }
  }

  async signinToken(req, res) {
    try {
      const { user } = req;
      user.set({ lastLoginAt: Date.now() });
      const u = await user.save();
      res.send({ user, token: req.cookies.jwt, ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }

  async resetPassword(req, res) {
    try {
      const match = await req.user.comparePassword(req.body.password);
      if (!match) {
        return res.status(401).send({ ok: false, code: PASSWORD_INVALID });
      }
      if (req.body.newPassword !== req.body.verifyPassword) {
        return res.status(422).send({ ok: false, code: PASSWORDS_NOT_MATCH });
      }
      if (!validatePassword(req.body.newPassword)) {
        return res.status(400).send({ ok: false, code: PASSWORD_NOT_VALIDATED });
      }
      const obj = await this.model.findById(req.user._id);

      obj.set({ password: req.body.newPassword });
      await obj.save();
      return res.status(200).send({ ok: true, user: obj });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }

  async forgotPassword(req, res, cta) {
    try {
      const obj = await this.model.findOne({ email: req.body.email.toLowerCase() });
      console.log("NOT FOUND", req.body.email.toLowerCase());
      if (!obj) return res.status(404).send({ ok: false, code: USER_NOT_EXISTS });
      const token = await crypto.randomBytes(20).toString("hex");
      obj.set({ forgotPasswordResetToken: token, forgotPasswordResetExpires: Date.now() + COOKIE_MAX_AGE });
      await obj.save();
      let htmlContent = fs.readFileSync(path.resolve(__dirname, "./templates/forgetpassword.html")).toString();
      htmlContent = htmlContent.replace(/{{cta}}/g, `${cta}?token=${token}`);
      await sendEmail({ name: `${obj.firstName} ${obj.lastName}`, email: obj.email }, "Réinitialiser mon mot de passe", htmlContent);
      return res.status(200).send({ ok: true }); //todo
    } catch (error) {
      console.log(error);
      capture(error);
      return res.status(500).send({ ok: false, code: SERVER_ERROR });
    }
  }

  async forgotPasswordReset(req, res) {
    try {
      const obj = await this.model.findOne({ forgotPasswordResetToken: req.body.token, forgotPasswordResetExpires: { $gt: Date.now() } });
      if (!obj) return res.status(400).send({ ok: false, code: PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      if (!validatePassword(req.body.password)) return res.status(400).send({ ok: false, code: PASSWORD_NOT_VALIDATED });
      obj.password = req.body.password;
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
