import { ExtraErrorData, ReportingObserver } from "@sentry/integrations";
import {
  init,
  BrowserTracing,
  reactRouterV5Instrumentation,
  withSentryRouting,
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
  makeBrowserOfflineTransport,
  makeFetchTransport,
  Replay,
} from "@sentry/react";
import { environment, RELEASE, SENTRY_URL, SENTRY_TRACING_SAMPLE_RATE, apiURL, SENTRY_ON_ERROR_SAMPLE_RATE, SENTRY_SESSION_SAMPLE_RATE } from "./config";
import { Route } from "react-router-dom";
import { createBrowserHistory } from "history";

// Create Custom Sentry Route component
const SentryRoute = withSentryRouting(Route);
const history = createBrowserHistory();

function initSentry() {
  if (environment !== "development") {
    // Evite le spam sentry en local
    init({
      enabled: Boolean(SENTRY_URL),
      dsn: SENTRY_URL,
      environment: environment,
      release: RELEASE,
      normalizeDepth: 16,
      transport: makeBrowserOfflineTransport(makeFetchTransport),
      transportOptions: {
        maxQueueSize: 50,
      },
      integrations: [
        new ExtraErrorData({ depth: 16 }),
        new BrowserTracing({
          routingInstrumentation: reactRouterV5Instrumentation(history),
          // Pass tracing info to this domain
          tracingOrigins: [apiURL].map((url) => new URL(url).host),
        }),
        new ReportingObserver({
          types: ["crash", "deprecation", "intervention"],
        }),
        new Replay(),
      ],
      replaysSessionSampleRate: SENTRY_SESSION_SAMPLE_RATE,
      replaysOnErrorSampleRate: SENTRY_ON_ERROR_SAMPLE_RATE,
      tracesSampleRate: Number(SENTRY_TRACING_SAMPLE_RATE),
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
      urlPrefix: "https://moncompte.snu.gouv.fr/", // Update the URL prefix to match your application
    });
  }
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

export { initSentry, capture, captureMessage, SentryRoute, history };
