import { createRequire } from "node:module";
import json from "@rollup/plugin-json";

import defaultRollupConfig from "./rollup-base.mjs";

const require = createRequire(import.meta.url);

const packageJson = require("./package.json");

export default defaultRollupConfig({
  packageJson,
  exports: "named",
  plugins: [json()],
});
