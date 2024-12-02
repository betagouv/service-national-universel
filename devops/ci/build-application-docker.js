const process = require("node:process");
const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");
const UserInput = require("../scripts/lib/user-input");
const {
  childProcess,
  childProcessStdin,
  parseRegistryEndpoint,
  parseEnvFile,
} = require("../scripts/lib/utils");

async function loadEnvFile(path) {
  const contents = await readFile(path, { encoding: "utf8" });
  return parseEnvFile(contents);
}

async function main() {
  const input = new UserInput(`Build application docker image`)
    .arg("image", "Tag of the image (ex: rg.fr-par.scw.cloud/snu-ci:latest)")
    .opt("args-file", "Path to envfile with build arguments", { shortcut: "a" })
    .opt("secrets-file", "Path to envfile with secrets", { shortcut: "s" })
    .optBool("push", "Push image on registry", {
      default: false,
    })
    .optBool("login", "Login on registry", {
      default: false,
    })
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .validate();

  console.log(`Building image ${input.image}`);

  const { tagName } = parseRegistryEndpoint(input.image);

  const args = [
    "build",
    "--label",
    `created_at=${new Date().toISOString()}`,
    "-t",
    input.image,
    "-f",
    "devops/ci/Dockerfile",
    ".",
  ];

  const buildArgs = input.argsFile ? await loadEnvFile(input.argsFile) : {};
  buildArgs["RELEASE"] = tagName;

  for (const key in buildArgs) {
    const value = buildArgs[key];
    args.push("--build-arg");
    args.push(`${key}=${value}`);
  }

  const env = {
    ...process.env,
  };
  const secrets = input.secretsFile ? await loadEnvFile(input.secretsFile) : {};

  for (const key in secrets) {
    const value = secrets[key];
    args.push("--secret");
    args.push(`id=${key}`);
    env[key] = value;
  }

  await childProcess("docker", args, { env });

  if (input.login) {
    await childProcessStdin(
      "docker",
      ["login", registry, "-u", "nologin", "--password-stdin"],
      input.SCW_SECRET_KEY
    );
  }
  if (input.push) {
    await childProcess("docker", ["push", input.image]);
  }
}

if (require.main === module) {
  main();
}
