import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";

export const VitePluginWatchPackages = async (config) => {
  const externalFiles = [path.resolve(__dirname, "../packages/lib/dist", "index.mjs")];
  return {
    name: "vite-plugin-watch-workspace",
    // on build start, add the external files to Vite's watch list
    async buildStart() {
      externalFiles.map((file) => {
        this.addWatchFile(file);
      });
    },
    async handleHotUpdate({ file, server }) {
      if (externalFiles.includes(file)) {
        server.ws.send({ type: "full-reload" });
      }
    },
  };
};

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  // Sans VITE_ENVIRONMENT, le bundle retombait sur « development » : Sentry coupé et contrôles réservés à la production désactivés.
  if (command === "build" && !env.VITE_ENVIRONMENT) {
    throw new Error("VITE_ENVIRONMENT est obligatoire pour construire l'application (production, staging, ci, custom…)");
  }

  const plugins = [react({ plugins: [["@swc/plugin-styled-components", {}]] })];

  if (mode !== "development") {
    plugins.push(
      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        org: "betagouv",
        project: "snu-admin",
        authToken: env.SENTRY_AUTH_TOKEN,
        url: "https://sentry.incubateur.net",
        environment: mode,
        release: {
          name: env.VITE_RELEASE,
          deploy: {
            env: mode,
          },
        },
        // Sourcemaps envoyées à Sentry, jamais publiées avec le build
        sourcemaps: {
          filesToDeleteAfterUpload: ["./build/**/*.map"],
        },
        validate: true,
        reactComponentAnnotation: { enabled: true },

        // Helps troubleshooting - set to false to make plugin less noisy
        debug: true,
      }),
    );
  } else {
    // autp-reload when changes detected in snu-lib
    plugins.push(VitePluginWatchPackages());
  }

  return {
    build: {
      // "hidden" : pas de commentaire sourceMappingURL dans les bundles publiés
      sourcemap: mode !== "development" ? "hidden" : false,
      outDir: "build",
      port: 8082,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const HugeLibraries = [
              "xlsx",
              "date-fns",
              "validator",
              "libphonenumber-js",
              "@sentry",
              "react-dom",
              "react-router-dom",
              "react-redux",
              "react-datepicker",
              "react-redux-toastr",
              "react-select",
              "reactstrap",
              "core-js",
              "@headlessui",
              "chart.js",
              "@codegouvfr/react-dsfr",
              "@tanstack/react-query",
            ];
            if (HugeLibraries.some((libName) => id.includes(`node_modules/${libName}`))) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            }
          },
        },
      },
    },
    server: {
      port: 8082,
    },
    plugins: plugins,
    optimizeDeps: {
      include: ["snu-lib", "@snu/ds"],
      force: true,
    },
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    },
  };
});
