const process = require("node:process");
const UserInput = require("./lib/user-input");
const ScalewayClient = require("./lib/scaleway-client");
const { Config } = require("./lib/config");
const { childProcess } = require("./lib/utils");
const { GetSecrets, SECRET_FORMATS } = require("./get-secrets");

async function main() {
  const input = new UserInput(`Build application`)
    .arg("environment", "Environment (ci, staging, production)")
    .arg("application", "Application (api, app, admin)")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  const config = new Config(input.environment, input.application);
  const secrets = await new GetSecrets(scaleway, {
    projectName: config.projectName(),
    secretName: config.buildSecretName(),
    format: SECRET_FORMATS.ENVFILE,
  }).execute();

  const env = {
    ...secrets,
    ...process.env,
    APP_NAME: input.application,
  };

  await childProcess("npm", ["run", "build"], {
    env,
  });
}

if (require.main === module) {
  main();
}
