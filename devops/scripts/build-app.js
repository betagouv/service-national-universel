const { spawn } = require("node:child_process");
const process = require("node:process");
const path = require("node:path");
const UserInput = require("./lib/user-input");
const ScalewayClient = require("./lib/scaleway-client");
const { GetSecrets, SECRET_FORMATS } = require("./get-secrets");

function _envMappings(env) {
  switch (env) {
    case "ci":
      return { projectName: "snu-ci", secretName: "ci-moncompte" };
    case "staging":
      return { projectName: "snu-production", secretName: "staging-moncompte" };
    case "production":
      return {
        projectName: "snu-production",
        secretName: "production-moncompte",
      };
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
}

async function main() {
  const input = new UserInput(`Build application MonCompte`)
    .arg("environment", "Environment (ci, staging, production)")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  const { projectName, secretName } = _envMappings(input.environment);
  const config = await new GetSecrets(scaleway, {
    projectName: projectName,
    secretName: secretName,
    format: SECRET_FORMATS.ENVFILE,
  }).execute();

  const env = { ...config, ...process.env, APP_NAME: "app" };

  spawn("npm", ["run", "build", "--", "--", "--mode", input.environment], {
    stdio: "inherit",
    env,
    cwd: path.resolve(__dirname, "../.."), // ROOT
  });
}

if (require.main === module) {
  main();
}
