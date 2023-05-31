const { execSync } = require("child_process");

// Only on clever cloud?
if (process.env.CC_DEPLOYMENT_ID) {
  if (process.env.STAGING) {
    execSync("npm run build:staging --max_old_space_size=8192", {
      stdio: "inherit",
    });
  }
  if (process.env.PROD) {
    execSync("npm run build --max_old_space_size=8192", {
      stdio: "inherit",
    });
  }
}
