const fetch = require("node-fetch");
const { capture } = require("../../sentry");
const slack = require("../../slack");
const config = require("config");
const { getAccessToken } = require("./utils");

let token;

exports.handler = async () => {
  try {
    token = await getAccessToken(config.API_ANALYTICS_ENDPOINT, config.API_ANALYTICS_API_KEY);
    await fetch(`${config.API_ANALYTICS_ENDPOINT}/stats/refresh`, {
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
      text: `Perfect!`,
    });
  } catch (e) {
    slack.error({ title: "❌ Refresh Materialized Views", text: `${JSON.toString(e)}` });
    capture(e);
    throw e;
  }
};
