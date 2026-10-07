import path from "path";
import { defineConfig } from "vitest/config";

// Config de test séparée de vite.config.js : ce dernier charge sentryVitePlugin dès que
// mode !== "development" (donc aussi en mode "test"), sans authToken disponible ici.
export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  test: {
    // happy-dom plutôt que jsdom : jsdom (>=27) tire html-encoding-sniffer -> @exodus/bytes,
    // un paquet ESM-only que Node 20 ne peut pas require() depuis vitest en CJS (GOO-194).
    environment: "happy-dom",
    globals: false,
  },
});
