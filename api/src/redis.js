const redis = require("redis");
const config = require("config");
const { capture } = require("./sentry");
const { logger } = require("./logger");

let client = null;

async function initRedisClient() {
  if (!config.get("REDIS_URL")) {
    throw new Error("ERROR CONNECTION. REDIS URL EMPTY");
  }
  client = redis.createClient({
    url: config.REDIS_URL,
    pingInterval: 60_000,
    disableOfflineQueue: true,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 10000),
    },
  });

  client.on("error", (error) => {
    capture(error);
  });

  client.on("connect", () => logger.debug("REDIS: connect"));
  client.on("ready", () => logger.debug("REDIS: ready"));
  client.on("end", () => logger.debug("REDIS: end"));
  client.on("reconnecting", () => logger.debug("REDIS: reconnecting"));

  await client.connect();
}

async function closeRedisClient() {
  return await client.quit();
}

function getRedisClient() {
  return client;
}

module.exports = {
  initRedisClient,
  closeRedisClient,
  getRedisClient,
};
