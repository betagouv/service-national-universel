import * as Sentry from "@sentry/nestjs";

// Ensure to call this before importing any other modules!
Sentry.init({
    dsn: "https://2d5e4d8904f666d44cdf428e1fae427a@sentry.incubateur.net/250",
});