require("../mongo");
const generator = require("generate-password");

const agentModel = require("../models/agent");

async function createReferents() {
  try {
    let i = 0;
    let agents = require("./referents_region_departments.json");
    for (let agent of agents.slice(606, 607)) {
      let createdAgent = {
        region: agent.region,
        departments: [agent.department],
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        createdAt: agent.createdAt.$date,
        role: agent.role === "referent_region" ? "REFERENT_REGION" : "REFERENT_DEPARTMENT",
        organisationId: "621e030b207cb317e41ff571",
        password: generator.generate({ length: 10, numbers: true }),
      };
      await agentModel.create(createdAgent);
      i++;
      console.log(i);
    }

    console.log("DONE");
    process.exit(0);
  } catch (e) {
    console.log("e", e);
  }
}

createReferents();
