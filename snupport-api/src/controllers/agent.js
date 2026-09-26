const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Joi = require("joi");
const OrganisationModel = require("../models/organisation");
const { agentGuard } = require("../middlewares/authenticationGuards");
const { ERRORS } = require("../errors");
const { canAdministerAgents, canAssignRole, canManageAgent, ROLE_RANKS } = require("../utils/agentAdminScope");
const { validateParams, validateBody, idSchema } = require("../middlewares/validation");
const { SCHEMA_EMAIL, SCHEMA_ROLE } = require("../schemas");
const { requireRole } = require("../middlewares/userRoleGuards");
const { ipEmailRateLimiter } = require("../middlewares/rateLimit");

const { config } = require("../config");
const AgentModel = require("../models/agent");
const { validatePassword } = require("../utils");
const { hashResetToken } = require("../utils/resetToken");
const { cookieOptions, logoutCookieOptions } = require("../cookie-options");
const { signAgentToken } = require("../utils/agentToken");
const { serializeAgent, serializeAgentSelf, PUBLIC_FIELDS } = require("../utils/agentSerializer");

const { sendEmail } = require("../brevo");
const { serializeOrganisation } = require("../utils/organisation");

const SCHEMA_PASSWORD = Joi.string().pattern(/^\S+$/).message("{{#label}} must be a valid password");
const SCHEMA_TOKEN_LENGTH = 20;
const SCHEMA_TOKEN = Joi.string().length(SCHEMA_TOKEN_LENGTH, "hex");
const SCHEMA_FIRSTNAME = Joi.string().trim();
// Durée de validité du lien de réinitialisation. Elle était calculée avec JWT_MAX_AGE, exprimé en secondes,
// ajouté à un horodatage en millisecondes : le lien expirait au bout de 86 secondes.
const RESET_TOKEN_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour
const SCHEMA_LASTNAME = Joi.string().trim();
const MINUTE = 60 * 1000;
// Comptes agents des référents SNU : ils ne se connectent que via GET /v0/sso/signin, jamais par
// mot de passe direct (PM43). Dupliqué volontairement plutôt que partagé : même liste que
// ticketUpdate.js et controllers/v0/referent.js, aucun des trois n'exporte la sienne.
const REFERENT_ROLES = ["REFERENT_DEPARTMENT", "REFERENT_REGION"];

router.post(
  "/signin",
  ipEmailRateLimiter({ prefix: "agent-signin", windowMs: 15 * MINUTE, limit: 20 }),
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
      password: SCHEMA_PASSWORD,
    }).prefs({ presence: "required" }),
  ),
  async (req, res) => {
    const { password, email } = req.cleanBody;
    const invalid = () => res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });

    const user = await AgentModel.findOne({ email });
    // Un compte référent n'a pas d'accès par mot de passe (PM43) : refusé avant toute comparaison,
    // avec la même réponse qu'un email inconnu ou un mauvais mot de passe (PM42).
    if (!user || REFERENT_ROLES.includes(user.role)) return invalid();

    const userWithPassword = await AgentModel.findById(user._id).select("password");
    if (!userWithPassword.password) return invalid();

    const match = await userWithPassword.comparePassword(password);
    if (!match) return invalid();

    user.set({ lastLoginAt: Date.now() });
    await user.save();
    const token = signAgentToken(user);
    res.cookie("jwtzamoud", token, cookieOptions());
    const organisation = await OrganisationModel.findById(user.organisationId);

    // Le jeton ne vit que dans le cookie httpOnly : le renvoyer dans le corps le rendait lisible par un script injecté (L48).
    return res.status(200).send({ ok: true, user: serializeAgentSelf(user), organisation: serializeOrganisation(organisation) });
  },
);

router.post("/logout", agentGuard, async (req, res) => {
  // Effacer le cookie ne suffit pas : une copie du jeton (volée par XSS, restée sur un autre poste) restait
  // valable 24 h. Avancer lastLogoutAt révoque tous les jetons émis jusqu'ici pour cet agent (M98).
  req.user.set({ lastLogoutAt: Date.now() });
  await req.user.save();
  res.clearCookie("jwtzamoud", logoutCookieOptions());
  return res.status(200).send({ ok: true });
});

const requireAgentAdmin = (req, res, next) => {
  if (!canAdministerAgents(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  next();
};

router.post(
  "/",
  agentGuard,
  requireAgentAdmin,
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
      firstName: SCHEMA_FIRSTNAME,
      lastName: SCHEMA_LASTNAME,
      role: SCHEMA_ROLE,
    }).prefs({ presence: "required" }),
  ),
  async (req, res) => {
    if (!canAssignRole(req.user, req.cleanBody.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Mot de passe aléatoire que personne ne connaît : l'agent choisit le sien via « mot de passe oublié ».
    // Il n'est pas soumis à validatePassword, qui exige des classes de caractères qu'un hexadécimal n'a pas.
    const password = crypto.randomBytes(16).toString("hex");

    try {
      await AgentModel.create({
        ...req.cleanBody,
        password,
        organisationId: req.user.organisationId,
      });
      return res.status(200).send({ ok: true });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(200).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
      }
      throw error;
    }
  },
);

router.delete("/:id", agentGuard, requireAgentAdmin, validateParams(idSchema), async (req, res) => {
  const { id } = req.cleanParams;
  const agent = await AgentModel.findById(id);
  if (!agent) {
    return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_EXISTS });
  }
  if (!canManageAgent(req.user, agent)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  await AgentModel.findByIdAndDelete(id);
  return res.status(200).send({ ok: true });
});

router.patch(
  "/:id",
  agentGuard,
  requireAgentAdmin,
  validateParams(idSchema),
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
      firstName: SCHEMA_FIRSTNAME,
      lastName: SCHEMA_LASTNAME,
    }).min(1),
  ),
  async (req, res) => {
    const agent = await AgentModel.findById(req.cleanParams.id);
    if (!agent) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_EXISTS });
    if (!canManageAgent(req.user, agent)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    await AgentModel.findOneAndUpdate({ _id: agent._id, organisationId: req.user.organisationId }, req.cleanBody);
    return res.status(200).send({ ok: true });
  },
);

router.get("/me", agentGuard, async (req, res) => {
  const { user } = req;
  user.set({ lastLoginAt: Date.now() });
  const organisation = await OrganisationModel.findOne({ _id: user.organisationId });
  await user.save();

  // Pas de jeton dans le corps : une XSS le lisait ici pour voler la session de l'agent (L48).
  res.send({ user: serializeAgentSelf(user), organisation: serializeOrganisation(organisation), ok: true });
});

router.get("/", agentGuard, requireRole("AGENT"), async (req, res) => {
  const agents = await AgentModel.find({}).select(PUBLIC_FIELDS.join(" "));
  const obj = Object.keys(ROLE_RANKS).reduce((acc, role) => ({ ...acc, [role]: [] }), {});
  agents.forEach((a) => obj[a.role] && obj[a.role].push(serializeAgent(a)));
  return res.status(200).send({ ok: true, data: obj });
});

router.post(
  "/forgot_password",
  ipEmailRateLimiter({ prefix: "agent-forgot-password", windowMs: 60 * MINUTE, limit: 10 }),
  validateBody(
    Joi.object({
      email: SCHEMA_EMAIL,
    }).prefs({ presence: "required" }),
  ),
  async (req, res) => {
    const { email } = req.cleanBody;
    const agent = await AgentModel.findOne({ email });
    // Toujours 200, que le compte existe ou non : un 404 renseignait un attaquant sur les emails
    // enregistrés (PM42). Le jeton n'est émis que si le compte existe et n'est pas référent (SSO
    // obligatoire, PM43) : sinon un référent pourrait s'auto-attribuer un mot de passe.
    if (agent && !REFERENT_ROLES.includes(agent.role)) {
      const token = crypto.randomBytes(SCHEMA_TOKEN_LENGTH).toString("hex");
      const tokenHash = hashResetToken({ token, secret: config.PASSWORD_RESET_TOKEN_SECRET });
      agent.set({ forgotPasswordResetToken: tokenHash, forgotPasswordResetExpires: Date.now() + RESET_TOKEN_MAX_AGE_MS });
      await agent.save();
      const subject = "Réinitialiser votre mot de passe";
      const body = `Une demande de réinitialisation de mot de passe a été faite, si elle vient bien de vous vous pouvez <a href="${config.SNUPPORT_URL_ADMIN}/auth/reset?token=${token}" style="color: #584FEC">cliquer ici pour réinitialiser votre mot de passe</a>`;
      await sendEmail([{ email: agent.email }], subject, body);
    }
    res.status(200).send({ ok: true });
  },
);

router.post(
  "/forgot_password_reset",
  ipEmailRateLimiter({ prefix: "agent-forgot-password-reset", windowMs: 60 * MINUTE, limit: 10 }),
  validateBody(
    Joi.object({
      token: SCHEMA_TOKEN,
      password: SCHEMA_PASSWORD,
      passwordConfirm: SCHEMA_PASSWORD,
    }).prefs({ presence: "required" }),
  ),
  async (req, res) => {
    const { token, password, passwordConfirm } = req.cleanBody;
    const tokenHash = hashResetToken({ token, secret: config.PASSWORD_RESET_TOKEN_SECRET });
    const agent = await AgentModel.findOne({ forgotPasswordResetToken: tokenHash, forgotPasswordResetExpires: { $gt: Date.now() } });
    // Défense en profondeur (PM43) : un jeton émis juste avant le déploiement (fenêtre résiduelle
    // <= RESET_TOKEN_MAX_AGE_MS) ne doit pas non plus rouvrir un accès par mot de passe à un compte
    // référent. Même réponse qu'un jeton invalide ou expiré, pour ne rien laisser filtrer (PM42).
    if (!agent || REFERENT_ROLES.includes(agent.role)) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
    if (password !== passwordConfirm) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
    if (!validatePassword(password)) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });

    agent.password = password;
    // Révoque les sessions ouvertes avec l'ancien mot de passe, dont celle d'un éventuel attaquant (M98).
    agent.passwordChangedAt = Date.now();
    agent.forgotPasswordResetToken = "";
    agent.forgotPasswordResetExpires = "";
    await agent.save();
    return res.status(200).send({ ok: true });
  },
);

/*
Routes deleted as not used :
PUT /agent
GET /agent/search
*/

module.exports = router;
