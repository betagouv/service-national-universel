import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "index.js",
  output: {
    file: "common-js/index.cjs",
    format: "cjs",
  },
  plugins: [
    resolve(),
    commonjs(), // Add this right after resolve()
    babel({ babelHelpers: "bundled" }),
  ],
};
