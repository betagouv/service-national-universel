import {
  extraErrorDataIntegration,
  reportingObserverIntegration,
  init,
  reactRouterV5BrowserTracingIntegration,
  withSentryRouting,
  moduleMetadataIntegration,
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
  makeBrowserOfflineTransport,
  makeFetchTransport,
} from "@sentry/react";
import { redactFrontBreadcrumb, redactFrontSentryEvent } from "@snu/log-redaction";
import { RELEASE, SENTRY_TRACING_SAMPLE_RATE, apiURL, SENTRY_DEBUG_MODE, environment } from "./config";
import { Route } from "react-router-dom";
import { createBrowserHistory } from "history";

// Create Custom Sentry Route component

const SentryRoute = withSentryRouting(Route);
const history = createBrowserHistory();

function initSentry() {
  if (environment !== "development") {
    // Evite le spam sentry en local
    init({
      debug: SENTRY_DEBUG_MODE,
      dsn: "https://c817c8150fe3dc49bb989119fe2871b8@sentry.incubateur.net/241",
      environment,
      release: RELEASE,
      normalizeDepth: 16,
      transport: makeBrowserOfflineTransport(makeFetchTransport),
      transportOptions: {
        maxQueueSize: 50,
      },
      // Pas d'en-têtes, de cookies ni d'IP : le JWT de session voyage dans l'en-tête Authorization.
      sendDefaultPii: false,
      // Corps de requête/réponse, query strings, state Redux et console retirés (FH7, FM4, FM5, FM6).
      beforeSend: redactFrontSentryEvent,
      beforeSendTransaction: redactFrontSentryEvent,
      beforeBreadcrumb: redactFrontBreadcrumb,
      tracePropagationTargets: ["localhost", apiURL],
      integrations: [
        extraErrorDataIntegration({ depth: 16 }),
        reactRouterV5BrowserTracingIntegration({ history }),
        moduleMetadataIntegration(),
        reportingObserverIntegration({
          types: ["crash", "deprecation", "intervention"],
        }),
      ],
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
