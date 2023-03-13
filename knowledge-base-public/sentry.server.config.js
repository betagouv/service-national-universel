// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE;

Sentry.init({
  enabled: false && Boolean(SENTRY_DSN),
  dsn: SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: Number(SENTRY_TRACING_SAMPLE_RATE || 0.01),
  environment: "kb",
  deploy: {
    env: "kb",
  },
  validate: true,
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
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
