const { config } = require("./config");
const { logger } = require("./logger");

// Require this first!
const { initSentry } = require("./sentry");

initSentry();

logger.info(`ENVIRONMENT: ${config["ENVIRONMENT"]}`);
logger.info(`RELEASE: ${config["RELEASE"]}`);

require("events").EventEmitter.defaultMaxListeners = 35; // Fix warning node (Caused by ElasticMongoose-plugin)

// ! Ignore specific error
const originalConsoleError = console.error;
console.error = function (message) {
  if (typeof message === "string" && message.includes("AWS SDK for JavaScript (v2) into maintenance mode")) return;
  originalConsoleError.apply(console, arguments);
};

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection");
  // Use the process.uncaughtException default handler
  // that prints the stack trace to stderr and exits with code 1
  // https://nodejs.org/api/process.html#event-uncaughtexception
  throw reason;
});

if (config.RUN_TASKS) {
  const { runTasks } = require("./mainJob");
  runTasks();
} else {
  const { runAPI } = require("./main");
  runAPI();
}
