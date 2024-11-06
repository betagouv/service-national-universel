const process = require("node:process");
const UserInput = require("./lib/user-input");
const ScalewayClient = require("./lib/scaleway-client");
const { GetSecrets, SECRET_FORMATS } = require("./get-secrets");
const { getConfig } = require("./lib/config");
const { childProcess, childProcessStdin } = require("./lib/utils");

const SECRET_KEYS = new Set(["SENTRY_AUTH_TOKEN"]);
const RELEASE_KEY = "VITE_RELEASE";

async function main() {
  const input = new UserInput(`Build application MonCompte`)
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
  const { projectName, secretName, registry } = getConfig(
    input.environment,
    input.application
  );
  const config = await new GetSecrets(scaleway, {
    projectName: projectName,
    secretName: secretName,
    format: SECRET_FORMATS.ENVFILE,
  }).execute();

  const env = { ...process.env };
  const values = { ...config, ...env }; // override config from env

  const image = `${registry}:${values[RELEASE_KEY]}`;

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
  for (const key in config) {
    const value = values[key];
    if (SECRET_KEYS.has(key)) {
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
      ["login", registry, "-u", "nologin", "--password-stdin"],
      input.SCW_SECRET_KEY,
      { env }
    );
    await childProcess("docker", ["push", image], { env });
  }
}

if (require.main === module) {
  main();
}
