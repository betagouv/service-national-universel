import { ExtraErrorData, Offline, ReportingObserver } from "@sentry/integrations";
import { init, reactRouterV5Instrumentation, withSentryRouting, captureException as sentryCaptureException, captureMessage as sentryCaptureMessage } from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { SENTRY_URL, apiURL } from "./config";
import { Route } from "react-router-dom";
import { createBrowserHistory } from "history";

// Create Custom Sentry Route component
const SentryRoute = withSentryRouting(Route);
const history = createBrowserHistory();

function initSentry() {
  init({
    enabled: Boolean(SENTRY_URL),
    dsn: SENTRY_URL,
    environment: "app",
    normalizeDepth: 16,
    integrations: [
      new ExtraErrorData({ depth: 16 }),
      new BrowserTracing({
        routingInstrumentation: reactRouterV5Instrumentation(history),
        // Pass tracing info to this domain
        tracingOrigins: [apiURL].map((url) => new URL(url).host),
      }),
      new Offline({ maxStoredEvents: 50 }),
      new ReportingObserver({
        types: ["crash", "deprecation", "intervention"],
      }),
    ],
    tracesSampleRate: Number(process?.env?.SENTRY_TRACING_SAMPLE_RATE || 1.0),
  });
}

function capture(err) {
  console.log("capture", err);
  if (err) {
    sentryCaptureException(err);
  }
}
function captureMessage(mess) {
  console.log("captureMessage", mess);
  if (mess) {
    sentryCaptureMessage(mess);
  }
}

export { initSentry, capture, captureMessage, SentryRoute, history };
