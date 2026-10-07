import path from "path";
import { defineConfig } from "vitest/config";

// Config de test séparée de vite.config.js : ce dernier charge sentryVitePlugin dès que
// mode !== "development" (donc aussi en mode "test"), sans authToken disponible ici.
export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  test: {
    environment: "jsdom",
    globals: false,
  },
});
