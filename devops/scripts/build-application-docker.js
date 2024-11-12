const process = require("node:process");
const UserInput = require("./lib/user-input");
const ScalewayClient = require("./lib/scaleway-client");
const { GetSecrets, SECRET_FORMATS } = require("./get-secrets");
const { Config } = require("./lib/config");
const {
  childProcess,
  childProcessStdin,
  registryEndpoint,
} = require("./lib/utils");

async function main() {
  const input = new UserInput(`Build application docker image`)
    .arg("environment", "Environment (ci, staging, production)")
    .arg("application", "Application (app, admin)")
    .optBool("push", "Push image on registry", {
      default: false,
    })
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
    ...process.env,
  };
  const values = { ...secrets, ...env }; // override secrets from env

  const image = registryEndpoint(
    config.registry(),
    values[config.releaseKey()]
  );

  const args = [
    "build",
    "--label",
    `created_at=${new Date().toISOString()}`,
    "-t",
    image,
    "-f",
    `${input.application}/Dockerfile`,
    ".",
  ];
  for (const key in secrets) {
    const value = values[key];
    if (config.mountSecretKeys().includes(key)) {
      args.push("--secret");
      args.push(`id=${key}`);
      env[key] = value;
    } else {
      args.push("--build-arg");
      args.push(`${key}=${value}`);
    }
  }

  await childProcess("docker", args, { env });

  if (input.push) {
    await childProcessStdin(
      "docker",
      ["login", config.registry(), "-u", "nologin", "--password-stdin"],
      input.SCW_SECRET_KEY,
      { env }
    );
    await childProcess("docker", ["push", image], { env });
  }
}

if (require.main === module) {
  main();
}
