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
const { ProfilingIntegration } = require("@sentry/profiling-node");

const { ENVIRONMENT, SENTRY_URL, SENTRY_TRACING_SAMPLE_RATE, SENTRY_PROFILE_SAMPLE_RATE } = require("./config");

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

function initSentry(app) {
  if (ENVIRONMENT !== "development") {
    console.log(`SENTRY_PROFILE_SAMPLE_RATE SENTRY JS: ${SENTRY_PROFILE_SAMPLE_RATE}`);
    console.log(` SENTRY_TRACING_SAMPLE_RATE SENTRY JS: ${SENTRY_TRACING_SAMPLE_RATE}`);
    // Evite le spam sentry en local
    init({
      enabled: Boolean(SENTRY_URL),
      dsn: SENTRY_URL,
      environment: "api",
      normalizeDepth: 16,
      integrations: [
        new ExtraErrorData({ depth: 16 }),
        new RewriteFrames({ root: process.cwd() }),
        new NodeIntegrations.Http({ tracing: true }),
        new NodeIntegrations.Modules(),
        new ProfilingIntegration(),
        ...autoDiscoverNodePerformanceMonitoringIntegrations(),
      ],
      tracesSampleRate: Number(SENTRY_TRACING_SAMPLE_RATE || 0.01),
      profilesSampleRate: Number(SENTRY_PROFILE_SAMPLE_RATE || 0.1), // Percent of Transactions profiled
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

  // The request handler must be the first middleware on the app
  app.use(Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Handlers.tracingHandler());

  return () => {
    // The error handler must be before any other error middleware and after all controllers
    app.use(Handlers.errorHandler());
  };
}

function capture(err, contexte) {
  console.log("capture", err);
  if (!err) {
    sentryCaptureMessage("Error not defined");
    return;
  }

  if (err instanceof Error) {
    sentryCaptureException(err, contexte);
  } else if (err.error instanceof Error) {
    sentryCaptureException(err.error, contexte);
  } else if (err.message) {
    sentryCaptureMessage(err.message, contexte);
  } else {
    sentryCaptureMessage("Error not defined well", { extra: { error: err, contexte: contexte } });
  }
}
function captureMessage(mess, contexte) {
  console.log("captureMessage", mess);
  if (!mess) {
    sentryCaptureMessage("Message not defined");
    return;
  }

  if (mess) {
    sentryCaptureMessage(mess, contexte);
  }
}

module.exports = {
  initSentry,
  capture,
  captureMessage,
};
