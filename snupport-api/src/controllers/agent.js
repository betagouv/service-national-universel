const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");
const OrganisationModel = require("../models/organisation");
const { agentGuard } = require("../middlewares/authenticationGuards");
const { ERRORS } = require("../errors");
const { requireRole } = require("../middlewares/userRoleGuards");
const { validateParams, validateBody, idSchema } = require("../middlewares/validation");
const { SCHEMA_EMAIL, SCHEMA_ROLE } = require("../schemas");

const { config } = require("../config");
const AgentModel = require("../models/agent");
const { validatePassword } = require("../utils");
const { cookieOptions, logoutCookieOptions } = require("../cookie-options");
const { JWT_MAX_AGE, JWT_VERSION } = require("../jwt-options");

const { sendEmail } = require("../brevo");

const SCHEMA_PASSWORD = Joi.string().pattern(/^\S+$/).message("{{#label}} must be a valid password");
const SCHEMA_TOKEN_LENGTH = 20;
const SCHEMA_TOKEN = Joi.string().length(SCHEMA_TOKEN_LENGTH, "hex");
const SCHEMA_FIRSTNAME = Joi.string().trim();
const SCHEMA_LASTNAME = Joi.string().trim();

router.post(
  "/signin",
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
      password: SCHEMA_PASSWORD,
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const { password, email } = req.cleanBody;

    const user = await AgentModel.findOne({ email });
    if (!user) return res.status(401).send({ ok: false, code: ERRORS.USER_NOT_EXISTS });

    const userWithPassword = await AgentModel.findById(user._id).select("password");
    // TODO: remove this code when all new users have password
    if (!userWithPassword.password) {
      user.set({ password });
      await user.save();
    } else {
      const match = await userWithPassword.comparePassword(password);
      if (!match) return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });
    }

    user.set({ lastLoginAt: Date.now() });
    await user.save();
    const token = jwt.sign({ __v: JWT_VERSION, _id: user._id }, config.JWT_SECRET, {
      expiresIn: JWT_MAX_AGE,
    });
    res.cookie("jwtzamoud", token, cookieOptions());
    const organisations = await OrganisationModel.find({});

    return res.status(200).send({ ok: true, user, organisation: organisations[0], token });
  }
);

router.post("/logout", agentGuard, async (req, res) => {
  res.clearCookie("jwtzamoud", logoutCookieOptions());
  return res.status(200).send({ ok: true });
});

router.post(
  "/",
  agentGuard,
  requireRole("AGENT"),
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
      firstName: SCHEMA_FIRSTNAME,
      lastName: SCHEMA_LASTNAME,
      role: SCHEMA_ROLE,
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const password = crypto.randomBytes(16).toString("hex");

    if (!validatePassword(password)) return res.status(200).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });

    const organisation = await OrganisationModel.findOne({ name: "SNU" });

    try {
      await AgentModel.create({
        ...req.cleanBody,
        password,
        organisationId: organisation._id,
      });
      return res.status(200).send({ ok: true });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(200).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
      }
      throw error;
    }
  }
);

router.delete("/:id", agentGuard, requireRole("AGENT"), validateParams(idSchema), async (req, res) => {
  const { id } = req.cleanParams;
  const agent = await AgentModel.findById(id);
  if (!agent) {
    return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_EXISTS });
  }
  await AgentModel.findByIdAndDelete(id);
  return res.status(200).send({ ok: true });
});

router.patch(
  "/:id",
  agentGuard,
  requireRole("AGENT"),
  validateParams(idSchema),
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
      firstName: SCHEMA_FIRSTNAME,
      lastName: SCHEMA_LASTNAME,
    }).min(1)
  ),
  async (req, res) => {
    await AgentModel.findOneAndUpdate({ _id: req.cleanParams.id, organisationId: req.user.organisationId }, req.cleanBody);
    return res.status(200).send({ ok: true });
  }
);

router.get("/me", agentGuard, async (req, res) => {
  const { user } = req;
  user.set({ lastLoginAt: Date.now() });
  const organisation = await OrganisationModel.findOne({ _id: user.organisationId });
  await user.save();

  res.send({ user, organisation, ok: true, token: req.cookies.jwtzamoud });
});

router.get("/", agentGuard, async (req, res) => {
  const agents = await AgentModel.find({});
  const obj = { AGENT: [], REFERENT_DEPARTMENT: [], REFERENT_REGION: [], DG: [] };
  agents.map((a) => obj[a.role].push(a));
  return res.status(200).send({ ok: true, data: obj });
});

router.post(
  "/forgot_password",
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const { email } = req.cleanBody;
    const agent = await AgentModel.findOne({ email });
    if (!agent) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_EXISTS });
    const token = crypto.randomBytes(SCHEMA_TOKEN_LENGTH).toString("hex");
    agent.set({ forgotPasswordResetToken: token, forgotPasswordResetExpires: Date.now() + JWT_MAX_AGE });
    await agent.save();
    const subject = "Réinitialiser votre mot de passe";
    const body = `Une demande de réinitialisation de mot de passe a été faite, si elle vient bien de vous vous pouvez <a href="${config.SNUPPORT_URL_ADMIN}/auth/reset?token=${token}" style="color: #584FEC">cliquer ici pour réinitialiser votre mot de passe</a>`;
    await sendEmail([{ email: agent.email }], subject, body);
    res.status(200).send({ ok: true });
  }
);

router.post(
  "/forgot_password_reset",
  validateBody(
    Joi.object({
      token: SCHEMA_TOKEN,
      password: SCHEMA_PASSWORD,
      passwordConfirm: SCHEMA_PASSWORD,
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const { token, password, passwordConfirm } = req.cleanBody;
    const agent = await AgentModel.findOne({ forgotPasswordResetToken: token, forgotPasswordResetExpires: { $gt: Date.now() } });
    if (!agent) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
    if (password !== passwordConfirm) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
    if (!validatePassword(password)) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });

    agent.password = password;
    agent.forgotPasswordResetToken = "";
    agent.forgotPasswordResetExpires = "";
    await agent.save();
    return res.status(200).send({ ok: true });
  }
);

/*
Routes deleted as not used :
PUT /agent
GET /agent/search
*/

module.exports = router;
