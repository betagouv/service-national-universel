const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { apiKeyGuard } = require("../../middlewares/authenticationGuards");
const { validateBody } = require("../../middlewares/validation");
const { KNOWLEDGE_BASE_ROLES, READER_TOKEN_MAX_AGE, signReaderToken } = require("../../utils/knowledgeBaseReader");

router.use(apiKeyGuard);

// Jeton de lecture de la base de connaissance (M86) : l'API v1 le demande pour un lecteur qu'elle
// vient d'authentifier, avec les rôles qu'elle lui reconnaît, et le lui transmet.
router.post(
  "/reader-token",
  validateBody(
    Joi.object({
      roles: Joi.array()
        .items(Joi.string().valid(...KNOWLEDGE_BASE_ROLES))
        .min(1)
        .unique(),
    }).prefs({ presence: "required" }),
  ),
  (req, res) => {
    return res.status(200).send({ ok: true, data: { token: signReaderToken(req.cleanBody.roles), expiresIn: READER_TOKEN_MAX_AGE } });
  },
);

module.exports = router;
