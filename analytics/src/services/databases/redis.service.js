const redis = require("redis");
const { REDIS_URL } = require("../../config");
const { capture } = require("../../sentry");
const REDIS_KEYS = require("./redis.constants");

const redisClient = redis.createClient({ url: REDIS_URL, pingInterval: 60_000 });

redisClient.on("connect", () => {
  console.info("Redis connection has been established successfully.");
});

redisClient.on("error", (error) => {
  capture(error);
});

try {
  redisClient.connect();
} catch (error) {
  capture(error);
}

const clearAllCache = async () => {
  try {
    return await redisClient.del([REDIS_KEYS.APP_PREFIX, "*"].join(":"));
  } catch (error) {
    capture(error);
  }
};

module.exports = { redisClient, clearAllCache };
