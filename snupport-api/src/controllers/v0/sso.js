const express = require("express");
const Joi = require("joi");
const router = express.Router();
const  { apiKeyGuard } = require("../../middlewares/authenticationGuards");
const { validateQuery } = require("../../middlewares/validation");
const jwt = require("jsonwebtoken");
const AgentModel = require("../../models/agent");
const { config } = require("../../config");
const { JWT_MAX_AGE, JWT_VERSION } = require("../../jwt-options");
const { SCHEMA_EMAIL, SCHEMA_ID } = require("../../schemas");
const { buildSsoAgentQuery } = require("../../utils/ssoAgent");

const NOT_FOUND = "NOT_FOUND";

router.use(apiKeyGuard);

router.get("/signin",
  validateQuery(Joi.object({
    email: SCHEMA_EMAIL,
    snuReferentId: SCHEMA_ID,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const query = buildSsoAgentQuery(req.cleanQuery);
    if (!query) return res.status(404).send({ ok: false, code: NOT_FOUND });

    const agent = await AgentModel.findOne(query);
    if (!agent) return res.status(404).send({ ok: false, code: NOT_FOUND });

    agent.set({ lastLoginAt: Date.now() });
    await agent.save();

    const token = jwt.sign({ __v: JWT_VERSION, _id: agent._id }, config.JWT_SECRET, {
      expiresIn: JWT_MAX_AGE,
    });
    const redirectLink = `${config.SNUPPORT_URL_ADMIN}/ticket`;
    return res.status(200).send({ ok: true, data: redirectLink, token });
  }
);

module.exports = router;
