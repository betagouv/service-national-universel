const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig } = require("./lib/config");
const { environmentFromBranch } = require("./lib/utils");

async function main() {
  const input = new UserInput("Get application endpoints from environment-name")
    .arg("environment-name", "Environment name")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  const config = new EnvConfig(environmentFromBranch(input.environmentName));

  const project = await scaleway.findProject(config.projectName());

  const namespace = await scaleway.findOrThrow(RESOURCE.ContainerNamespace, {
    project_id: project.id,
    name: config.containerNamespace(),
  });

  console.log(JSON.stringify(config.applicationUrls(namespace.registry_endpoint)));
}

if (require.main === module) {
  main();
}
