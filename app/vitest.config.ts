import path from "path";
import { defineConfig } from "vitest/config";

// Config de test séparée de vite.config.js : ce dernier échoue hors build de production
// (VITE_ENVIRONMENT obligatoire, plugin Sentry) et n'a pas besoin de l'être pour lancer des tests.
export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  test: {
    environment: "jsdom",
    globals: false,
  },
});
