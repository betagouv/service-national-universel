import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";

// eslint-disable-next-line no-unused-vars
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  const plugins = [react({ plugins: [["@swc/plugin-styled-components", {}]] })];
  if (mode !== "development") {
    plugins.push(
      sentryVitePlugin({
        org: "sentry",
        project: "snu-moncompte",
        authToken: env.SENTRY_AUTH_TOKEN,
        url: "https://sentry.selego.co/",
        environment: mode,
        release: {
          name: env.RELEASE,
        },
        deploy: {
          env: mode,
        },
        validate: true,
        sourcemaps: {
          // Specify the directory containing build artifacts
          assets: "./**",
          // Don't upload the source maps of dependencies
          ignore: ["./node_modules/**"],
        },

        // Helps troubleshooting - set to false to make plugin less noisy
        debug: true,
      }),
    );
  }
  return {
    server: {
      port: 8081,
    },
    plugins: plugins,
    build: { sourcemap: mode === "development" ? false : true, outDir: "build" },
    optimizeDeps: {
      include: ["@sentry/react", "snu-lib", "@snu/ds"],
      force: true,
    },
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    },
  };
});
