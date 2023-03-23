require("../../mongo");

const { ObjectId } = require("mongodb");
const fetch = require("node-fetch");
const { isInRuralArea, getAge } = require("snu-lib");

const { capture } = require("../../sentry");
const slack = require("../../slack");
const YoungModel = require("../../models/young");
const YoungPatchModel = require("./models/youngPatch");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../../config.js");
const { mongooseFilterForDayBefore, checkResponseStatus, getAccessToken, findAll, printResult } = require("./utils");

let token;
const result = { event: {} };

exports.handler = async () => {
  try {
    token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);
    await fetch(`${API_ANALYTICS_ENDPOINT}/stats/refresh`, {
      method: "POST",
      redirect: "follow",
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent": "*",
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    });
    await slack.info({
      title: "✅ Refresh Materialized Views",
      text: `<@U044RT0N3JR> Perfect!`,
    });
  } catch (e) {
    slack.error({ title: "❌ Refresh Materialized Views", text: `<@U044RT0N3JR> ${JSON.toString(e)}` });
    capture(e);
  }
};
