import config from "config";
import { createLogger, transports, format } from "winston";

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

function _format() {
  if (config.ENVIRONMENT === "development") {
    return format.combine(format.simple(), format.colorize({ all: true }));
  }
  return format.simple();
}

export const logger = createLogger({
  levels: LEVELS,
  level: config.get("LOG_LEVEL"),
  format: _format(),
  transports: [
    new transports.Console({
      forceConsole: true,
      stderrLevels: ["error"],
      consoleWarnLevels: ["warn"],
    }),
  ],
});
