const { captureException: sentryCaptureException, captureMessage: sentryCaptureMessage, init, extraErrorDataIntegration, rewriteFramesIntegration } = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

const config = require("config");

function initSentry() {
  if (config.get("ENABLE_SENTRY")) {
    init({
      dsn: config.get("SENTRY_URL"),
      environment: "api",
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

function _flattenStack(stack) {
  // Remove new lines and merge spaces to get 1 line log output
  return stack.replace(/\n/g, " | ").replace(/\s+/g, " ");
}

function captureError(err, contexte) {
  if (err.stack && config.get("ENABLE_FLATTEN_ERROR_LOGS")) {
    console.error("capture", _flattenStack(err.stack));
  } else {
    console.error("capture", err);
  }

  return sentryCaptureException(err, contexte);
}

function capture(err, contexte) {
  if (!err) {
    const msg = "Error not defined";
    console.error("capture", msg);
    return sentryCaptureMessage(msg);
  }

  if (err instanceof Error) {
    return captureError(err, contexte);
  } else if (err.error instanceof Error) {
    return captureError(err.error, contexte);
  } else if (err.message) {
    console.error("capture", err.message);
    return sentryCaptureMessage(err.message, contexte);
  } else {
    const msg = "Error not defined well : You should capture Error type";
    console.error("capture", msg);
    return sentryCaptureMessage(msg, { extra: { error: err, contexte: contexte } });
  }
}
function captureMessage(mess, contexte) {
  if (mess) {
    console.error("captureMessage", mess);
    return sentryCaptureMessage(mess, contexte);
  } else {
    const msg = "Empty message captured";
    console.error("captureMessage", msg);
    return sentryCaptureMessage(msg);
  }
}

module.exports = {
  initSentry,
  capture,
  captureMessage,
};
