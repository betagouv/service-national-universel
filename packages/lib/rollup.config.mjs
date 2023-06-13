import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export default {
  input: "index.js", // assuming your source files are in the 'src' directory
  output: {
    file: "common-js/index.cjs",
    format: "cjs",
  },
  plugins: [resolve(), babel({ babelHelpers: "bundled" })],
};
