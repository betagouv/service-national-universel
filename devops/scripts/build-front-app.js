const process = require("node:process");
const UserInput = require("./lib/user-input");
const ScalewayClient = require("./lib/scaleway-client");
const { getConfig } = require("./lib/config");
const { childProcess } = require("./lib/utils");
const { GetSecrets, SECRET_FORMATS } = require("./get-secrets");

async function main() {
  const input = new UserInput(`Build application MonCompte`)
    .arg("environment", "Environment (ci, staging, production)")
    .arg("application", "Frontend application (app, admin)")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  const { projectName, secretName } = getConfig(
    input.environment,
    input.application
  );
  const config = await new GetSecrets(scaleway, {
    projectName: projectName,
    secretName: secretName,
    format: SECRET_FORMATS.ENVFILE,
  }).execute();

  const env = {
    ...config,
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
