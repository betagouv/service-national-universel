const path = require("node:path");
const UserInput = require("../scripts/lib/user-input");
const {
  childProcess,
  childProcessStdin,
  parseRegistryEndpoint,
} = require("../scripts/lib/utils");


async function main() {
  const input = new UserInput(`Build application docker image`)
    .arg("image", "Tag of the image (ex: rg.fr-par.scw.cloud/snu-ci:latest)")
    .arg("secrets-file", "Path to envfile with secrets")
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
    "--progress",
    "plain",
    "--label",
    `created_at=${new Date().toISOString()}`,
    "-t",
    input.image,
    "-f",
    "devops/ci/Dockerfile",
    ".",
  ];

  args.push("--secret");
  args.push(`id=BUILD_SECRETS,src=${path.resolve(input.secretsFile)}`);

  await childProcess("docker", args);

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
