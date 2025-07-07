const express = require("express");
const Joi = require("joi");
const  { apiKeyGuard } = require("../../middlewares/authenticationGuards");
const { validateBody } = require("../../middlewares/validation");
const router = express.Router();
const AgentModel = require("../../models/agent");
const OrganisationModel = require("../../models/organisation");
const { SCHEMA_ID, SCHEMA_EMAIL, SCHEMA_ROLE} = require("../../schemas");

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
      role: SCHEMA_ROLE.uppercase(),
    }))
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const agentsSNU = req.cleanBody.referents;
    for (let agentSNU of agentsSNU) {
      let agent = await AgentModel.findOne({ snuReferentId: agentSNU.id });
      if (!agent) agent = await AgentModel.findOne({ email: agentSNU.email });
      else if (agent.email !== agentSNU.email) {
        await AgentModel.findOneAndDelete({ email: agentSNU.email });
      }

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
    return res.status(200).send({ ok: true });
  }
);

router.delete("/",
  validateBody(Joi.object({
    email: SCHEMA_EMAIL,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const agent = await AgentModel.findOne(req.cleanBody);
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
