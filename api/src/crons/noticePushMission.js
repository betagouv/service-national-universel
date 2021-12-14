require("dotenv").config({ path: "./../../.env-staging" });
require("../mongo");
const esClient = require("../es");

const { capture } = require("../sentry");
const Mission = require("../models/mission");
const Referent = require("../models/referent");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../config");

exports.handler = async () => {
  try {
    const header = { index: "mission", type: "_doc" };
    const query = {
      bool: {
        filter: [
          {
            range: {
              endAt: {
                gte: "now",
              },
            },
          },
          { term: { "status.keyword": "VALIDATED" } },
          {
            range: {
              placesLeft: {
                gt: 0,
              },
            },
          },
        ],
      },
    };

    const body = [
      header,
      {
        query,
        size: 100,
      },
    ]
      .map((e) => `${JSON.stringify(e)}\n`)
      .join("");
    const response = await esClient.msearch({
      index: "mission",
      body,
    });
    console.log("✍️ ~ response", response?.body?.responses[0]?.hits?.hits);
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
    slack.error({ title: "outdated mission", text: "An error occured 😢" });
  }
};
