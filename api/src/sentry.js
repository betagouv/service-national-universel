const { captureException: sentryCaptureException, captureMessage: sentryCaptureMessage, init, extraErrorDataIntegration, rewriteFramesIntegration } = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

const config = require("config");
const { logger } = require("./logger");

function initSentry() {
  if (config.get("ENABLE_SENTRY")) {
    init({
      dsn: "https://584ccb2737f20b13078d0b80b9eeacab@sentry.selego.co/160",
      environment: config.ENVIRONMENT,
      release: config.get("RELEASE"),
      normalizeDepth: 16,
      integrations: [extraErrorDataIntegration({ depth: 16 }), rewriteFramesIntegration({ root: process.cwd() }), nodeProfilingIntegration()],
      tracesSampleRate: Number(config.get("SENTRY_TRACING_SAMPLE_RATE")) || 0.01,
      profilesSampleRate: Number(config.get("SENTRY_PROFILE_SAMPLE_RATE")) || 0.1, // Percent of Transactions profiled
      ignoreErrors: [
        /^No error$/,
        /__show__deepen/,
        /_avast_submit/,
        /Access is denied/,
        /anonymous function: captureException/,
        /Blocked a frame with origin/,
        /can't redefine non-configurable property "userAgent"/,
        /change_ua/,
        /console is not defined/,
        /cordova/,
        /DataCloneError/,
        /Error: AccessDeny/,
        /event is not defined/,
        /feedConf/,
        /ibFindAllVideos/,
        /myGloFrameList/,
        /SecurityError/,
        /MyIPhoneApp/,
        /snapchat.com/,
        /vid_mate_check is not defined/,
        /win\.document\.body/,
        /window\._sharedData\.entry_data/,
        /window\.regainData/,
        /ztePageScrollModule/,
      ],
    });
  }
}

// * Adopt the same error capture strategy as Sentry
// * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause#examples

function _flattenStack(stack) {
  // Remove new lines and merge spaces to get 1 line log output
  return stack.replace(/\n/g, " | ").replace(/\s+/g, " ");
}

function captureError(err, contexte) {
  if (err.stack && config.get("ENABLE_FLATTEN_ERROR_LOGS")) {
    const flattened = _flattenStack(err.stack);
    logger.error(`capture: ${flattened}`);
  } else {
    logger.error(`capture: ${err}`);
  }

  return sentryCaptureException(err, contexte);
}

function capture(err, contexte) {
  if (!err) {
    const msg = "Error not defined";
    logger.error(`capture: ${msg}`);
    sentryCaptureMessage(msg);
    return;
  }

  if (err instanceof Error) {
    // Capture the current error and recursively capture any nested causes
    captureError(err, contexte);

    let currentError = err.cause;
    while (currentError instanceof Error) {
      captureError(currentError, contexte);
      currentError = currentError.cause;
    }
  } else if (err.error instanceof Error) {
    capture(err.error, contexte); // Recursively handle the nested error
  } else if (err.message) {
    logger.error(`capture: ${err.message}`);
    sentryCaptureMessage(err.message, contexte);
  } else {
    const msg = "Error not defined well: You should capture Error type";
    logger.error(`capture: ${msg}`);
    sentryCaptureMessage(msg, { extra: { error: err, contexte: contexte } });
  }
}

function captureMessage(mess, contexte) {
  if (mess) {
    logger.error(`capture message: ${mess}`);
    return sentryCaptureMessage(mess, contexte);
  } else {
    const msg = "Empty message captured";
    logger.error(`capture message: ${msg}`);
    return sentryCaptureMessage(msg);
  }
}

module.exports = {
  initSentry,
  capture,
  captureMessage,
};
