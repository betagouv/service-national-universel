import { ExtraErrorData, Offline, ReportingObserver } from "@sentry/integrations";
import { init, reactRouterV5Instrumentation, withSentryRouting, captureException as sentryCaptureException, captureMessage as sentryCaptureMessage } from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
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
      integrations: [
        new ExtraErrorData({ depth: 16 }),
        new BrowserTracing({
          routingInstrumentation: reactRouterV5Instrumentation(history),
          // Pass tracing info to this domain
          tracingOrigins: [SNUPPORT_URL_API].map((url) => new URL(url).host),
        }),
        new Offline({ maxStoredEvents: 50, maxCacheSize: 10000000 }),
        new ReportingObserver({
          types: ["crash", "deprecation", "intervention"],
        }),
      ],
      replaysSessionSampleRate: 0.005,
      replaysOnErrorSampleRate: 1,
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
      urlPrefix: "https://admin-support.snu.gouv.fr/", // Update the URL prefix to match your application
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
