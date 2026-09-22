const { capture } = require("../sentry");
const { logger } = require("../logger");
const { config } = require("../config");
const { redactValue, redactUrl } = require("../utils/logRedaction");

const loggingMiddleware = async (req, res, next) => {
  const startTime = new Date();
  res.on("finish", async () => {
    try {
      const responseTimeMs = new Date() - startTime;
      req.responseTimeMs = responseTimeMs;

      const ip = req.ipInfo;

      const log = {
        method: req.method,
        // les secrets voyagent aussi en segment de chemin (/contract/token/:token) et en query string
        url: redactUrl(req.originalUrl, req.params),
        status: res.statusCode,
        responseTime: req.responseTimeMs,
        ip,
      };

      // Le body d'une requête porte des données personnelles (identité, adresse, santé) qu'aucune redaction
      // par nom de clé ne peut reconnaître : on ne le journalise jamais en production.
      const hasPayload = config.ENVIRONMENT !== "production" && req.body && Object.keys(req.body).length > 0;
      if (hasPayload) {
        // Copie redactée du body : mots de passe et tokens masqués, emails tronqués (voir utils/logRedaction)
        log.payload = redactValue(req.body);
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
