const fetch = require("node-fetch");

const config = require("config");
const { logger } = require("./logger");
const { capture, captureMessage } = require("./sentry");

const STATUS_PREFIX = {
  error: "❌",
  success: "✅",
};

const STATUS_COLOR = {
  error: "#c62828",
  success: "#4caf50",
  info: "#0288d1",
};

const postMessage = async ({ title, text, author_name, color }) => {
  if (!config.SLACK_BOT_TOKEN || !config.SLACK_BOT_CHANNEL) return captureMessage("NO SLACK CREDENTIALS");
  const payload = {
    channel: config.SLACK_BOT_CHANNEL,
    attachments: [
      {
        title,
        text,
        author_name,
        color,
      },
    ],
  };
  if (config.ENVIRONMENT === "production") {
    fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": payload.length,
        Authorization: `Bearer ${config.SLACK_BOT_TOKEN}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        capture(error);
      });
  } else {
    logger.debug("slack", payload?.attachments);
  }
};

const error = async (args) => {
  await postMessage({ color: STATUS_COLOR.error, ...args, title: `${STATUS_PREFIX.error} ${args?.title}` });
};
const success = async (args) => {
  await postMessage({ color: STATUS_COLOR.success, ...args, title: `${STATUS_PREFIX.success} ${args?.title}` });
};
const info = async (args) => {
  await postMessage({ color: STATUS_COLOR.info, ...args });
};

module.exports = { postMessage, error, success, info };
