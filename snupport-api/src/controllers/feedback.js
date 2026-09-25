const express = require("express");
const router = express.Router();
const Joi = require("joi");
const FeedbackModel = require("../models/feedback");
const ContactModel = require("../models/contact");
const KnowledgeBaseModel = require("../models/knowledgeBase");
const { agentGuard, apiKeyGuard } = require("../middlewares/authenticationGuards");
const { validateBody, validateQuery } = require("../middlewares/validation");
const { SCHEMA_ID, SCHEMA_EMAIL } = require("../schemas");
const { ERRORS } = require("../errors");

const FEEDBACK_COMMENT_MAX_LENGTH = 2000;

// Feedback sur un article de la base de connaissance (M83). La route était publique : n'importe qui
// créait en boucle des contacts (email arbitraire) et des commentaires rattachés à n'importe quel
// identifiant. Elle ne sert que l'API v1 (`POST /SNUpport/knowledgeBase/feedback`), qui applique la
// limitation de débit par IP et ne transmet que l'email de la session : clé d'API exigée, article
// publié exigé, commentaire borné, et un contact n'est plus jamais créé ici.
router.post("/",
  apiKeyGuard,
  validateBody(Joi.object({
    isPositive: Joi.boolean(),
    knowledgeBaseArticle: SCHEMA_ID,
    contactEmail: SCHEMA_EMAIL.optional(),
    comment: Joi.string().trim().max(FEEDBACK_COMMENT_MAX_LENGTH).optional(),
  }).prefs({ presence: 'required' })),
  async function (req, res) {
    const { contactEmail, ...rest } = req.cleanBody;
    const article = await KnowledgeBaseModel.exists({ _id: rest.knowledgeBaseArticle, type: "article", status: "PUBLISHED" });
    if (!article) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const feedback = { ...rest };
    const contact = contactEmail ? await ContactModel.findOne({ email: contactEmail }, { _id: 1 }) : null;
    if (contact) feedback.createdBy = contact._id;
    await FeedbackModel.create(feedback);
    return res.status(200).send({ ok: true });
  }
);

router.get("/",
  agentGuard,
  validateQuery(Joi.object({
    knowledgeBaseArticle: SCHEMA_ID,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const data = await FeedbackModel.find(req.cleanQuery);
    return res.status(200).send({ ok: true, data });
  }
);

router.put("/archivefeedbacks",
  agentGuard,
  validateBody(Joi.object({
    selectedComments: Joi.array().items(SCHEMA_ID),
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    await FeedbackModel.updateMany({ _id: req.cleanBody.selectedComments }, { treatedAt: new Date(), treatedBy: req.user });
    return res.status(200).send({ ok: true });
  }
);

router.get("/usefulArticles", agentGuard, async (req, res) => {
  const mostUsefulArticles = await FeedbackModel.aggregate([
    {
      $group: {
        _id: "$knowledgeBaseArticle",
        positiveFeedback: { $sum: { $cond: ["$isPositive", 1, 0] } },
        negativeFeedback: { $sum: { $cond: ["$isPositive", 0, 1] } },
        untreatedComment: { $sum: { $cond: [{ $and: [{ $ifNull: ["$comment", false] }, { $not: { $ifNull: ["$treatedAt", false] } }] }, 1, 0] } },
        treatedComment: { $sum: { $cond: [{ $and: [{ $ifNull: ["$comment", false] }, { $ifNull: ["$treatedAt", false] }] }, 1, 0] } },
      },
    },
    { $sort: { positiveFeedback: -1 } },
  ]);

  await KnowledgeBaseModel.populate(mostUsefulArticles, { path: "_id" });

  const lessLikedArticles = [...mostUsefulArticles];
  lessLikedArticles.sort((a, b) => b.negativeFeedback - a.negativeFeedback);

  const mostUntreatedComments = [...mostUsefulArticles];
  mostUntreatedComments.sort((a, b) => b.untreatedComment - a.untreatedComment);

  const mostTreatedComments = [...mostUsefulArticles];
  mostTreatedComments.sort((a, b) => b.treatedComment - a.treatedComment);

  return res.status(200).send({ ok: true, data: { mostUsefulArticles, lessLikedArticles, mostUntreatedComments, mostTreatedComments } });
});

module.exports = router;
