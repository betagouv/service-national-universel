const { execSync } = require("child_process");

// Only on clever cloud?
if (process.env.CC_DEPLOYMENT_ID) {
  if (process.env.STAGING) {
    execSync("npm run build:staging", {
      stdio: "inherit",
    });
  }
  if (process.env.PROD) {
    execSync("npm run build", {
      stdio: "inherit",
    });
  }
}
