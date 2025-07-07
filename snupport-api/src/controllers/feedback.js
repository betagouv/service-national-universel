const express = require("express");
const router = express.Router();
const Joi = require("joi");
const FeedbackModel = require("../models/feedback");
const ContactModel = require("../models/contact");
const KnowledgeBaseModel = require("../models/knowledgeBase");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { validateBody, validateQuery } = require("../middlewares/validation");
const { SCHEMA_ID, SCHEMA_EMAIL } = require("../schemas");


router.post("/",
  validateBody(Joi.object({
    isPositive: Joi.boolean(),
    knowledgeBaseArticle: SCHEMA_ID,
    contactEmail: SCHEMA_EMAIL.optional(),
    comment: Joi.string().trim().optional(),
  }).prefs({ presence: 'required' })),
  async function (req, res) {
    const { contactEmail, ...rest } = req.cleanBody;
    let contact;
    if (contactEmail) {
      contact = await ContactModel.findOne({ email: contactEmail });
      if (!contact) contact = await ContactModel.create({ email: contactEmail });
    }
    const feedback = { ...rest };
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
