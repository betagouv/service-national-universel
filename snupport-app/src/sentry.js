import {
  extraErrorDataIntegration,
  reportingObserverIntegration,
  init,
  reactRouterV5BrowserTracingIntegration,
  withSentryRouting,
  captureException as sentryCaptureException,
  captureMessage as sentryCaptureMessage,
  makeBrowserOfflineTransport,
  makeFetchTransport,
} from "@sentry/react";
import { redactFrontBreadcrumb, redactFrontSentryEvent } from "@snu/log-redaction";
import { RELEASE, ENVIRONMENT, SNUPPORT_URL_API, SENTRY_DEBUG_MODE } from "./config";
import { Route } from "react-router-dom";
import { createBrowserHistory } from "history";

const SENTRY_DSN = "https://b1a616158b6fef6786192fa9651dc31e@sentry.incubateur.net/246";

// Create Custom Sentry Route component
const SentryRoute = withSentryRouting(Route);
const history = createBrowserHistory();

function initSentry() {
  if (ENVIRONMENT !== "development") {
    init({
      debug: SENTRY_DEBUG_MODE,
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      release: RELEASE,
      normalizeDepth: 16,
      transport: makeBrowserOfflineTransport(makeFetchTransport),
      transportOptions: {
        maxQueueSize: 50,
      },
      // Pas d'en-têtes, de cookies ni d'IP : ils peuvent porter le JWT de session.
      sendDefaultPii: false,
      // Corps de requête/réponse, query strings, state Redux et console retirés (FH7, FM4).
      beforeSend: redactFrontSentryEvent,
      beforeSendTransaction: redactFrontSentryEvent,
      beforeBreadcrumb: redactFrontBreadcrumb,
      // Pass tracing info to this domain
      tracePropagationTargets: [SNUPPORT_URL_API],
      integrations: [
        extraErrorDataIntegration({ depth: 16 }),
        reactRouterV5BrowserTracingIntegration({ history }),
        reportingObserverIntegration({
          types: ["crash", "deprecation", "intervention"],
        }),
      ],
      tracesSampleRate: 0.01,
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
    sentryCaptureMessage("Error not defined well", { extra: { error: err } });
  }
}
function captureMessage(mess, contexte) {
  console.log("captureMessage", mess);
  if (!mess) {
    sentryCaptureMessage("Error not defined");
    return;
  }

  if (mess) {
    sentryCaptureMessage(mess, contexte);
  }
}

export { initSentry, capture, captureMessage, SentryRoute, history };
