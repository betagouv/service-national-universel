import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";

// eslint-disable-next-line no-unused-vars
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  const plugins = [react({ plugins: [["@swc/plugin-styled-components", {}]] })];

  if (mode !== "development") {
    plugins.push(
      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        org: "sentry",
        project: "snu-admin",
        authToken: env.SENTRY_AUTH_TOKEN,
        url: "https://sentry.selego.co/",
        environment: mode,
        release: {
          name: env.RELEASE,
          deploy: {
            env: mode,
          },
        },
        validate: true,
        reactComponentAnnotation: { enabled: true },

        // Helps troubleshooting - set to false to make plugin less noisy
        debug: true,
      }),
    );
  }

  return {
    build: {
      sourcemap: mode !== "development",
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
