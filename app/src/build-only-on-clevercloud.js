/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require("child_process");

// Only on clever cloud?
if (process.env.CC_DEPLOYMENT_ID) {
  if (process.env.ENVIRONMENT == "staging") {
    execSync("npm run build:staging", {
      stdio: "inherit",
    });
  }
  if (process.env.ENVIRONMENT == "production") {
    execSync("npm run build", {
      stdio: "inherit",
    });
  }
}
