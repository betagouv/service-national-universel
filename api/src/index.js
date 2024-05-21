const { resolveAsyncConfigs } = require('config/async');
const config = require("config");

require("events").EventEmitter.defaultMaxListeners = 35; // Fix warning node (Caused by ElasticMongoose-plugin)

// ! Ignore specific error
const originalConsoleError = console.error;
console.error = function (message) {
  if (typeof message === "string" && message.includes("AWS SDK for JavaScript (v2) into maintenance mode")) return;
  originalConsoleError.apply(console, arguments);
};

// process.on("unhandledRejection", (err) => {
//   console.error(err);
//   process.exit(1);
// });

resolveAsyncConfigs(config)
  .then(config => {
    const {runCrons, runAPI} = require('./main.js')

    if (process.env.RUN_CRONS) {
      runCrons();
    } else {
      runAPI();
    }
  });
