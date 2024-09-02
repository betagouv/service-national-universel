const { capture } = require("../sentry");
const { logger } = require("../logger");

const loggingMiddleware = async (req, res, next) => {
  const startTime = new Date();
  res.on("finish", async () => {
    try {
      const responseTimeMs = new Date() - startTime;
      req.responseTimeMs = responseTimeMs;

      if (req.body?.password) req.body.password = "**********";

      const ip = req.ipInfo;

      const log = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: req.responseTimeMs,
        ip,
      };

      const hasPayload = req.body && Object.keys(req.body).length > 0;
      if (hasPayload) {
        log.payload = req.body;
      }

      if (req.user) {
        log.userID = req.user.id;
        const userRole = req.user.patches.modelName === "ReferentPatches" && "referent";
        if (userRole) {
          log.userRole = req.user?.role;
        }
      }
      logger.info("api", log);
    } catch (error) {
      capture(error);
    }
  });
  next();
};

module.exports = loggingMiddleware;
