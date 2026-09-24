import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // plugins array
  let plugins = [react({ plugins: [["@swc/plugin-styled-components", {}]] })];

  if (mode !== "development") {
    plugins.push(
      sentryVitePlugin({
        org: "betagouv",
        project: "snupport-app",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        url: "https://sentry.incubateur.net",
        environment: mode,
        release: {
          name: process.env.VITE_RELEASE,
          deploy: {
            env: mode,
          },
        },
        // Sourcemaps envoyées à Sentry, jamais publiées avec le build
        sourcemaps: {
          filesToDeleteAfterUpload: ["./build/**/*.map"],
        },
        setCommits: {
          auto: true,
        },
      })
    );
  }

  return defineConfig({
    // the rest of the configuration goes here
    server: {
      port: 8092,
    },
    build: {
      // "hidden" : pas de commentaire sourceMappingURL dans les bundles publiés
      sourcemap: mode !== "development" ? "hidden" : false,
      outDir: "build",
      rollupOptions: {
        output: {
          manualChunks(id) {
            const HugeLibraries = ["react-dom", "react-router-dom", "react-redux", "emoji-mart", "slate", "slate-react", "xlsx", "validator"];
            if (HugeLibraries.some((libName) => id.includes(`node_modules/${libName}`))) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            }
          },
        },
      },
    },
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    },
    plugins: plugins,
  });
};
