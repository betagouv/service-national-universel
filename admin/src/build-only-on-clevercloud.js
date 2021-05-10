const { execSync } = require("child_process");

// Only on clever cloud.
if (process.env.CC_DEPLOYMENT_ID) {
  execSync("npm run build", {
    stdio: "inherit",
  });
}
