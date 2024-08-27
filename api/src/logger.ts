import config from "config";
import { createLogger, transports, format } from "winston";

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

export const logger = createLogger({
  levels: LEVELS,
  level: config.get("LOG_LEVEL"),
  format: format.cli(),
  transports: [new transports.Console()],
});
