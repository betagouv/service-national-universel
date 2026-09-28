const { logger } = require("../logger");

// PL20 : morgan écrivait ses lignes d'accès directement sur la console, hors du pipeline winston
// (et donc de la redaction @snu/log-redaction) déjà en place pour le reste de l'application.
const morganLogStream = {
  write(message) {
    logger.http(message.trim());
  },
};

module.exports = { morganLogStream };
