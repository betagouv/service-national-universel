// Chargé par Next.js au démarrage du serveur : c'est ici que Sentry s'initialise côté serveur
// depuis @sentry/nextjs 8 (sentry.server.config.js n'est plus injecté automatiquement).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
