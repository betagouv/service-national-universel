const { resolveAsyncConfigs } = require("config/async");
const config = require("config");

// NODE_ENV environment variable (default "development") is used by :
// - node-config : to determine the config file used in ./config
// - jest : unit test (NODE_ENV == "test")
const environment = config.util.getEnv("NODE_ENV");
console.log("ENVIRONMENT:", environment);

if (!process.env.SCW_ACCESS_KEY || !process.env.SCW_SECRET_KEY) {
  const message = "SCW_ACCESS_KEY & SCW_SECRET_KEY are required to get configuration secrets";
  if (environment === "development") {
    console.warn(message);
  } else {
    console.error(message);
    process.exitCode = 1;
    return;
  }
}

require("events").EventEmitter.defaultMaxListeners = 35; // Fix warning node (Caused by ElasticMongoose-plugin)

// ! Ignore specific error
const originalConsoleError = console.error;
console.error = function (message) {
  if (typeof message === "string" && message.includes("AWS SDK for JavaScript (v2) into maintenance mode")) return;
  originalConsoleError.apply(console, arguments);
};

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

resolveAsyncConfigs(config).then((config) => {
  const { runCrons, runAPI } = require("./main");

  if (process.env.RUN_CRONS === "true") {
    runCrons();
  } else {
    runAPI();
  }
});
