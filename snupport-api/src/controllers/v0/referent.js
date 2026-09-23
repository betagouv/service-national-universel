const express = require("express");
const Joi = require("joi");
const  { apiKeyGuard } = require("../../middlewares/authenticationGuards");
const { validateBody } = require("../../middlewares/validation");
const router = express.Router();
const AgentModel = require("../../models/agent");
const OrganisationModel = require("../../models/organisation");
const { SCHEMA_ID, SCHEMA_EMAIL } = require("../../schemas");
const { capture } = require("../../sentry");
const slack = require("../../slack");

const REFERENT_ROLES = ["REFERENT_DEPARTMENT", "REFERENT_REGION"];

// Le compte `holder` porte déjà l'email du référent synchronisé. Il ne peut être repris que s'il est
// le compte de ce référent, ou un compte référent qui n'est rattaché à aucun référent SNU (comptes
// créés avant l'introduction de snuReferentId). Un agent du support (AGENT, DG) n'est jamais repris.
function canAdoptAgent(holder, agentSNU, agentById) {
  if (agentById && String(agentById._id) === String(holder._id)) return true;
  if (agentById) return false;
  if (!REFERENT_ROLES.includes(holder.role)) return false;
  return !holder.snuReferentId || String(holder.snuReferentId) === String(agentSNU.id);
}

router.use(apiKeyGuard);

router.post("/",
  validateBody(Joi.object({
    referents: Joi.array().items(Joi.object({
      id: SCHEMA_ID,
      email: SCHEMA_EMAIL,
      firstName: Joi.string().trim(),
      lastName: Joi.string().trim(),
      departments: Joi.array().items(Joi.string().allow("").trim()),
      region: Joi.string().trim(),
      // La synchro ne porte que des référents : elle ne doit jamais créer un agent ou un DG du support.
      role: Joi.string().uppercase().valid(...REFERENT_ROLES),
    }))
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const agentsSNU = req.cleanBody.referents;
    const rejected = [];
    for (let agentSNU of agentsSNU) {
      let agent = await AgentModel.findOne({ snuReferentId: agentSNU.id });
      // Un autre compte support porte déjà l'email de ce référent (M93). L'ancienne synchro le
      // supprimait, ou le réécrivait en référent : un changement d'email côté SNU suffisait à effacer
      // ou à reprendre le compte d'un agent du support. On ne touche à rien et on alerte.
      const holder = await AgentModel.findOne({ email: agentSNU.email });
      if (holder && !canAdoptAgent(holder, agentSNU, agent)) {
        rejected.push(agentSNU);
        continue;
      }
      if (!agent) agent = holder;

      if (agent) {
        if (isIdenticalAgent(agent, agentSNU)) continue;
        agent.email = agentSNU.email;
        agent.firstName = agentSNU.firstName;
        agent.lastName = agentSNU.lastName;
        agent.departments = agentSNU.departments;
        agent.region = agentSNU.region;
        agent.role = agentSNU.role;
        agent.snuReferentId = agentSNU.id;
        await agent.save();
      } else {
        const organisation = await OrganisationModel.findOne({ name: "SNU" });
        await AgentModel.create({
          snuReferentId: agentSNU.id,
          email: agentSNU.email,
          firstName: agentSNU.firstName,
          lastName: agentSNU.lastName,
          departments: agentSNU.departments,
          region: agentSNU.region,
          role: agentSNU.role,
          organisationId: organisation._id,
        });
      }
    }
    if (rejected.length) {
      const text = rejected.map((referent) => `referent ${referent.id}`).join(", ");
      capture(new Error(`Synchro référents : email déjà porté par un autre compte support (${text})`));
      await slack.error({ title: "Synchro référents SNUpport refusée", text: `Email déjà porté par un autre compte support : ${text}` });
    }
    return res.status(200).send({ ok: true });
  }
);

router.delete("/",
  validateBody(Joi.object({
    email: SCHEMA_EMAIL,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    // Seul un compte référent est supprimé à la suppression d'un référent SNU, jamais un agent du support.
    const agent = await AgentModel.findOne({ email: req.cleanBody.email, role: { $in: REFERENT_ROLES } });
    if (!agent) return res.status(404).send({ ok: false, code: "NOT_FOUND" });

    await agent.deleteOne();
    return res.status(200).send({ ok: true });
  }
);

module.exports = router;

function isIdenticalAgent(agentBdd, agentSnu) {
  if (agentBdd.email !== agentSnu.email) return false;
  if (agentBdd.firstName !== agentSnu.firstName) return false;
  if (agentBdd.lastName !== agentSnu.lastName) return false;
  if (agentBdd.region !== agentSnu.region) return false;
  if (agentBdd.departments !== agentSnu.department) return false;
  if (agentBdd.role !== agentSnu.role) return false;
  return true;
}
