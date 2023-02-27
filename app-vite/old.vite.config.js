import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      babelHelpers: "runtime",
      presets: ["@babel/preset-react"],
      plugins: [
        [
          "@babel/plugin-transform-runtime",
          {
            useESModules: true,
          },
        ],
      ],
    }),
    commonjs(), // added the commonjs plugin
  ],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
});
