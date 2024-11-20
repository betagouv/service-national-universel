const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig } = require("./lib/config");

async function main() {
  const input = new UserInput("Delete test environment on Scaleway")
    .arg("environment-name", "Environment name")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  const config = new EnvConfig(input.environmentName);

  const project = await scaleway.findProject(config.projectName());

  const namespace = await scaleway.findOrThrow(RESOURCE.ContainerNamespace, {
    project_id: project.id,
    name: config.containerNamespace(),
  });

  console.log(namespace.registry_endpoint);
}

if (require.main === module) {
  main();
}
