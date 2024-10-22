const express = require("express");
const router = express.Router();

const { capture } = require("../sentry");
const { db } = require("../services/databases/postgresql.service");
const { redisClient } = require("../services/databases/redis.service");
const REDIS_KEYS = require("../services/databases/redis.constants");

router.get("/.health", async (req, res) => {
  try {
    const servicesCached = await redisClient.get([REDIS_KEYS.APP_PREFIX, "health"].join(":"));
    if (servicesCached) {
      return res.status(200).send({ ok: true, services: JSON.parse(servicesCached) });
    }

    const services = {
      database: await db
        .authenticate()
        .then(() => "up")
        .catch(() => "down"),
      cache: await redisClient
        .ping()
        .then((res) => (res === "PONG" ? "up" : "down"))
        .catch(() => "down"),
    };

    redisClient.set([REDIS_KEYS.APP_PREFIX, "health"].join(":"), JSON.stringify(services), { EX: 20 });
    return res.status(200).send({ ok: true, services });
  } catch (error) {
    capture(error);
  }
});

module.exports = router;
