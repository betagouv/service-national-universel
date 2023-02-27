import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import fs from "fs/promises";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      // extensions: [".js", ".jsx", ".ts", ".tsx"],
      babelHelpers: "runtime",
      presets: [
        "@babel/preset-react",
        // [
        //   "@babel/preset-env",
        //   {
        //     targets: ">0.2%,not dead,not op_mini all",
        //     useBuiltIns: "usage",
        //     corejs: {
        //       version: 3,
        //       proposals: true,
        //     },
        //   },
        // ],
      ],
      plugins: [
        [
          "@babel/plugin-transform-runtime",
          {
            useESModules: true,
            // corejs: {
            //   version: 3,
            //   proposals: true,
            // },
          },
        ],
        // "@babel/plugin-proposal-class-properties",
        // "@babel/plugin-proposal-object-rest-spread",
        // "@babel/plugin-proposal-async-generator-functions",
        // "@babel/plugin-transform-parameters",
      ],
    }),
    commonjs(), // added the commonjs plugin
  ],
  // resolve: {
  //   extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  // },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  build: {
    commonjsOptions: {
      include: [/lib-cjs/, /node_modules/],
    },
  },
  optimizeDeps: {
    include: ["@vite-mono/lib-cjs"],
    esbuildOptions: {
      plugins: [
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => {
              const temp = await fs.readFile(args.path, "utf8");
              console.log("🚀 ~ file: vite.config.js:69 ~ build.onLoad ~ temp:", temp);
              return {
                loader: "jsx",
                contents: temp,
              };
            });
          },
        },
      ],
    },
  },
});
