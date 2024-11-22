const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig } = require("./lib/config");
const { environmentFromBranch } = require("./lib/utils");

async function main() {
  const input = new UserInput("Get application endpoints from environment-name")
    .arg("environment-name", "Environment name")
    .optBool(
      "from-branch",
      "Retreive environmentInterpret environment-name as a branch name",
      {
        default: false,
      }
    )
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  let envName = input.environmentName;
  if (input.fromBranch) {
    envName = environmentFromBranch(envName);
  }

  const config = new EnvConfig(envName);

  const project = await scaleway.findProject(config.projectName());

  const namespace = await scaleway.findOrThrow(RESOURCE.ContainerNamespace, {
    project_id: project.id,
    name: config.containerNamespace(),
  });

  console.log(config.applicationUrls(namespace.registry_endpoint));
}

if (require.main === module) {
  main();
}
