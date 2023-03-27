require("../../mongo");

const fetch = require("node-fetch");
const { capture } = require("../../sentry");
const slack = require("../../slack");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../../config.js");
const { getAccessToken } = require("./utils");

let token;

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
