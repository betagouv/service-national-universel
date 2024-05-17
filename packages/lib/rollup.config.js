import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "index.js",
  output: {
    file: "common-js/index.cjs",
    format: "cjs",
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: "bundled" }),
    typescript()
  ],
};
