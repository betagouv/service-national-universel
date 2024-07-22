const redis = require("redis");
const config = require("config");
const { capture } = require("./sentry");

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
    capture(new Error(`Redis client error: ${error.message}`));
  });

  client.on("connect", () => console.log("REDIS: connect"));
  client.on("ready", () => console.log("REDIS: ready"));
  client.on("end", () => console.log("REDIS: end"));
  client.on("reconnecting", () => console.log("REDIS: reconnecting"));

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
