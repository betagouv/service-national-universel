const config = require("config");

// NODE_ENV environment variable (default "development") is used by :
// - node-config : to determine the config file used in ./config
// - jest : unit test (NODE_ENV == "test")
const environment = config.util.getEnv("NODE_ENV");
console.log("ENVIRONMENT:", environment);

require("events").EventEmitter.defaultMaxListeners = 35; // Fix warning node (Caused by ElasticMongoose-plugin)

// ! Ignore specific error
const originalConsoleError = console.error;
console.error = function (message) {
  if (typeof message === "string" && message.includes("AWS SDK for JavaScript (v2) into maintenance mode")) return;
  originalConsoleError.apply(console, arguments);
};

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection");
  // Use the process.uncaughtException default handler
  // that prints the stack trace to stderr and exits with code 1
  // https://nodejs.org/api/process.html#event-uncaughtexception
  throw reason;
});

const { runTasks, runAPI } = require("./main");
if (process.env.RUN_TASKS === "true") {
  runTasks();
} else {
  runAPI();
}
