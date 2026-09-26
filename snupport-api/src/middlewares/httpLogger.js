const { redactUrl } = require("@snu/log-redaction");
const { logger } = require("../logger");

// PL20 (audit du 25/09/2026) : morgan("dev") écrivait req.originalUrl directement sur stdout, hors
// du filet de redaction winston (logger.ts, redactLogInfo) — email en clair sur GET /v0/ticket et
// GET /v0/sso/signin (?email=…&snuReferentId=…), consultées à chaque ouverture de la messagerie.
function httpLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    logger.http(`${req.method} ${redactUrl(req.originalUrl, req.params)} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}

module.exports = { httpLogger };
