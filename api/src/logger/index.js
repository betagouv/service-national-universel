const config = require("config");
import { createLogger, transports, format } from "winston";

export const logger = createLogger({
  level: config.get("LOG_LEVEL"),
  format: format.simple(),
  transports: [new transports.Console()],
});
