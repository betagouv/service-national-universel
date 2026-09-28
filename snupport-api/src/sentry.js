const { ExtraErrorData, RewriteFrames } = require("@sentry/integrations");
const {
  addGlobalEventProcessor,
  captureException: sentryCaptureException,
  captureMessage: sentryCaptureMessage,
  Integrations: NodeIntegrations,
  init,
  Handlers,
} = require("@sentry/node");
const { Integrations: TracingIntegrations } = require("@sentry/tracing");
const { config } = require("./config");
const { logger } = require("./logger");
const { redactSentryEvent } = require("@snu/log-redaction");

const SENTRY_DSN = "https://787fecd515b1c56eda166634937df903@sentry.incubateur.net/245";

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
  if (config.ENABLE_SENTRY) {
    init({
      debug: config.SENTRY_DEBUG_MODE,
      dsn: SENTRY_DSN,
      environment: config.ENVIRONMENT,
      release: config.RELEASE,
      normalizeDepth: 16,
      // `Handlers.requestHandler()` joint à l'événement le corps de la requête, les en-têtes et les cookies :
      // secrets et PII y sont masqués ici, ainsi que dans tout `extra`.
      beforeSend: redactSentryEvent,
      // PH18 : les transactions de performance ne passent pas par beforeSend — sans ce hook dédié,
      // chaque requête échantillonnée partait avec cookies, en-têtes et corps en clair.
      beforeSendTransaction: redactSentryEvent,
      integrations: [
        new ExtraErrorData({ depth: 16 }),
        new RewriteFrames({ root: process.cwd() }),
        new NodeIntegrations.Http({ tracing: true }),
        new NodeIntegrations.Modules(),
        new TracingIntegrations.Mongo({ useMongoose: true }),
        new TracingIntegrations.Express({ app }),
      ],
      tracesSampleRate: 0.01,
      profilesSampleRate: 0.1,
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
    // The request handler must be the first middleware on the app
    // PM36 : par défaut ce handler legacy (v7) joint aussi les en-têtes, cookies et le corps bruts à
    // chaque transaction, en amont de beforeSendTransaction — restreint à method/url, seuls attributs
    // dont ce lot garantit l'absence de secret.
    app.use(Handlers.requestHandler({ request: ["method", "url"] }));
  
    // TracingHandler creates a trace for every incoming request
    app.use(Handlers.tracingHandler());
  
    return () => {
      // The error handler must be before any other error middleware and after all controllers
      app.use(Handlers.errorHandler());
    };
  }
  return () => {};
}

function capture(err, contexte) {
  // `logger` et non `console` : le format winston masque secrets et PII, `console` écrit en clair sur stdout
  logger.error(`capture: ${err}`);
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
    sentryCaptureMessage("Error not defined well", { extra: { error: err } });
  }
}
function captureMessage(mess, contexte) {
  logger.error(`capture message: ${mess}`);
  if (!mess) {
    sentryCaptureMessage("Error not defined");
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
