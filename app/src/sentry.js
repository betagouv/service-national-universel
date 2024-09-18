import {
  extraErrorDataIntegration,
  reportingObserverIntegration,
  init,
  reactRouterV5BrowserTracingIntegration,
  withSentryRouting,
  moduleMetadataIntegration,
  httpClientIntegration,
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
  makeBrowserOfflineTransport,
  makeFetchTransport,
  replayIntegration,
} from "@sentry/react";
import { environment, RELEASE, SENTRY_TRACING_SAMPLE_RATE, apiURL, SENTRY_ON_ERROR_SAMPLE_RATE, SENTRY_SESSION_SAMPLE_RATE } from "./config";
import { Route } from "react-router-dom";
import { createBrowserHistory } from "history";

// Create Custom Sentry Route component
const SentryRoute = withSentryRouting(Route);
const history = createBrowserHistory();

function initSentry() {
  if (environment !== "development") {
    // Evite le spam sentry en local
    init({
      dsn: "https://9f62b6f87edc757e44b10d7728db5913@sentry.selego.co/143",
      environment,
      release: RELEASE,
      normalizeDepth: 16,
      transport: makeBrowserOfflineTransport(makeFetchTransport),
      transportOptions: {
        maxQueueSize: 50,
      },
      sendDefaultPii: true,
      tracePropagationTargets: ["localhost", apiURL],
      integrations: [
        extraErrorDataIntegration({ depth: 16 }),
        reactRouterV5BrowserTracingIntegration({ history }),
        httpClientIntegration(),
        moduleMetadataIntegration(),
        reportingObserverIntegration({
          types: ["crash", "deprecation", "intervention"],
        }),
        replayIntegration(),
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
    sentryCaptureMessage("Error not defined well : You should capture Error type", { extra: { error: err, contexte: contexte } });
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
