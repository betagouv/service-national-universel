import { config } from "./config";
import { createLogger, transports, format } from "winston";
import { redactLogInfo } from "@snu/log-redaction";

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Filet de sécurité : aucun secret (tokens, mots de passe, clés) ni email en clair ne doit atteindre les transports,
// quel que soit le code appelant (message texte, dump JSON, meta).
const redact = format(redactLogInfo);

function _format() {
  if (config.ENVIRONMENT === "development") {
    return format.combine(redact(), format.simple(), format.colorize({ all: true }));
  }
  return format.combine(redact(), format.simple());
}

export const logger = createLogger({
  levels: LEVELS,
  level: config.LOG_LEVEL,
  format: _format(),
  transports: [
    new transports.Console({
      forceConsole: true,
      stderrLevels: ["error"],
      consoleWarnLevels: ["warn"],
    }),
  ],
});
