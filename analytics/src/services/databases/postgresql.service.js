require("dotenv").config();
const { Sequelize } = require("sequelize");
const { ENVIRONMENT, POSTGRESQL } = require("../../config");
const { capture } = require("../../sentry");
const { redisClient } = require("../../services/databases/redis.service");
const REDIS_KEYS = require("../../services/databases/redis.constants");

const db = new Sequelize(POSTGRESQL, {
  logging: ENVIRONMENT === "development",
});

db.authenticate()
  .then(() => console.info("Postgresql connection has been established successfully."))
  .catch(capture);

/**
 *
 * @param {{ key: string, ttl?: number }} options - Cache options, ttl in seconds
 * @param {Object} model - Sequelize model or DB instance
 * @param {string} action - Sequelize action (eg: count, findAll, query)
 * @param {Object|string} query - Sequelize query object or raw query
 * @param {Object} [queryOptions] - Sequelize query options, ex: db.query('SELECT * FROM log_youngs WHERE id = :id', { type: db.QueryTypes.SELECT, replacements: { id: 1 })
 *
 * @returns - Sequelize result
 */
db.cacheRequest = async (options, model, action, query, queryOptions) => {
  if (!options.key) throw new Error("Missing key in cache options");
  if (!model[action]) throw new Error(`Missing action ${action} in model`);

  try {
    const key = [REDIS_KEYS.PG_CACHE, options.key, Buffer.from(JSON.stringify(query) + JSON.stringify(queryOptions)).toString("base64")].join(":");
    const cachedResult = await redisClient.get(key);
    if (cachedResult) return JSON.parse(cachedResult);

    const result = await model[action](query, queryOptions);

    // 24 hours caching by default
    // logs are updated every night at 2am
    redisClient.set(key, JSON.stringify(result), { EX: options.ttl || 60 * 60 * 24 });

    return result;
  } catch (error) {
    capture(error);

    // If anything goes wrong, return the result without caching
    return model[action](query, queryOptions);
  }
};

/**
 * @param {string[]} [keys] - Cache keys
 */
db.cacheClear = async (keys) => {
  try {
    if (!keys) return await redisClient.del([REDIS_KEYS.PG_CACHE, "*"].join(":"));
    return await redisClient.del(keys.map((key) => [REDIS_KEYS.PG_CACHE, key, "*"].join(":")));
  } catch (error) {
    capture(error);
  }
};

module.exports = { db };
