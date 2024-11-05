const { spawn } = require("node:child_process");
const process = require("node:process");
const path = require("node:path");
const UserInput = require("./lib/user-input");
const ScalewayClient = require("./lib/scaleway-client");
const { GetSecrets, SECRET_FORMATS } = require("./get-secrets");
const { getConfig } = require("./lib/config");

const SECRET_KEYS = new Set(["SENTRY_AUTH_TOKEN"]);
const RELEASE_KEY = "VITE_RELEASE";

const APP_NAME = "app";

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
  const { projectName, secretName, registry } = getConfig(input.environment);
  const config = await new GetSecrets(scaleway, {
    projectName: projectName,
    secretName: secretName,
    format: SECRET_FORMATS.ENVFILE,
  }).execute();

  const env = { ...process.env };
  const values = { ...config, ...env }; // override config from env

  const args = [
    "build",
    "--label",
    `created_at=${new Date().toISOString()}`,
    "-t",
    `${registry}/${APP_NAME}:${values[RELEASE_KEY]}`,
    "-f",
    `${APP_NAME}/Dockerfile`,
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

  spawn("docker", args, {
    stdio: "inherit",
    env,
    cwd: path.resolve(__dirname, "../.."),
  });
}

if (require.main === module) {
  main();
}
