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

// eslint-disable-next-line no-unused-vars
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  const plugins = [react({ plugins: [["@swc/plugin-styled-components", {}]] })];
  if (mode !== "development") {
    plugins.push(
      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        org: "sentry",
        project: "snu-moncompte",
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
  } else {
    // autp-reload when changes detected in snu-lib
    // plugins.push(VitePluginWatchPackages());
  }
  return {
    server: {
      port: 8081,
    },
    plugins: plugins,
    build: {
      sourcemap: mode !== "development",
      outDir: "build",
      rollupOptions: {
        output: {
          manualChunks: {
            "react-dom": ["react-dom"],
            "react-router-dom": ["react-router-dom"],
            "react-redux": ["react-redux"],
            "react-redux-toastr": ["react-redux-toastr"],
            "react-select": ["react-select"],
            reactstrap: ["reactstrap"],
            "@sentry/react": ["@sentry/react"],
            "@codegouvfr/react-dsfr": ["@codegouvfr/react-dsfr"],
            "tanstack/react-query": ["@tanstack/react-query"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["snu-lib", "@snu/ds"],
      // force: true,
    },
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    },
  };
});
