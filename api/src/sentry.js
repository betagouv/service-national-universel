const { ExtraErrorData, RewriteFrames } = require("@sentry/integrations");
const {
  addGlobalEventProcessor,
  captureException: sentryCaptureException,
  captureMessage: sentryCaptureMessage,
  Integrations: NodeIntegrations,
  init,
  Handlers,
  autoDiscoverNodePerformanceMonitoringIntegrations,
} = require("@sentry/node");

const config = require("config");

const regex = /[0-9a-fA-F]{24}/g;

const sanitizeTransactionName = (name) => {
  return name.replace(regex, ":id");
};

addGlobalEventProcessor((event) => {
  if (event.type === "transaction") {
    event.transaction = sanitizeTransactionName(event.transaction);
  }
  return event;
});

function initSentry() {
  const { ProfilingIntegration } = require("@sentry/profiling-node");
  init({
    enabled: Boolean(config.SENTRY_URL),
    dsn: config.SENTRY_URL,
    environment: "api",
    release: config.RELEASE,
    normalizeDepth: 16,
    integrations: [
      new ExtraErrorData({ depth: 16 }),
      new RewriteFrames({ root: process.cwd() }),
      new NodeIntegrations.Http({ tracing: true }),
      new NodeIntegrations.Modules(),
      new ProfilingIntegration(),
      ...autoDiscoverNodePerformanceMonitoringIntegrations(),
    ],
    tracesSampleRate: Number(config.SENTRY_TRACING_SAMPLE_RATE) || 0.01,
    profilesSampleRate: Number(config.SENTRY_PROFILE_SAMPLE_RATE) || 0.1, // Percent of Transactions profiled
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

function initSentryMiddlewares(app) {
  if (config.ENVIRONMENT !== "development") {
    // Evite le spam sentry en local
    initSentry();
  }

  // The request handler must be the first middleware on the app
  app.use(Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Handlers.tracingHandler());

  return () => {
    // The error handler must be before any other error middleware and after all controllers
    app.use(Handlers.errorHandler());
  };
}

function _flattenStack(stack) {
  // Remove new lines and merge spaces to get 1 line log output
  return stack.replace(/\n/g, " | ").replace(/\s+/g, ' ');
}

function captureError(err, contexte) {
  if (err.stack && config.ENABLE_FLATTEN_ERROR_LOG) {
    console.error("capture", _flattenStack(err.stack));
  } else {
    console.error("capture", err);
  }
  sentryCaptureException(err, contexte);
}

function capture(err, contexte) {
  if (!err) {
    const msg = "Error not defined"
    console.error("capture", msg);
    sentryCaptureMessage(msg);
    return;
  }

  if (err instanceof Error) {
    captureError(err, contexte);
  } else if (err.error instanceof Error) {
    captureError(err.error, contexte);
  } else if (err.message) {
    console.error("capture", err.message);
    sentryCaptureMessage(err.message, contexte);
  } else {
    const msg = "Error not defined well"
    console.error("capture", msg);
    sentryCaptureMessage(msg, { extra: { error: err, contexte: contexte } });
  }
}
function captureMessage(mess, contexte) {
  if (mess) {
    console.error("captureMessage", mess);
    sentryCaptureMessage(mess, contexte);
  } else {
    const msg = "Message not defined"
    console.error("captureMessage", msg);
    sentryCaptureMessage(msg);
  }
}

module.exports = {
  initSentry,
  initSentryMiddlewares,
  capture,
  captureMessage,
};
