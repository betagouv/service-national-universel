const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { AppConfig } = require("./lib/config");
const { registryEndpoint } = require("./lib/utils");

async function main() {
  const input = new UserInput(`Deploy application on Scaleway`)
    .arg("environment", "Environment (ci, staging, production)")
    .arg("application", "Application (app, admin)")
    .arg("release", "Release")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  const config = new AppConfig(input.environment, input.application);

  const project = await this.scaleway.findProject(config.projectName());

  const namespace = await scaleway.findOrThrow(RESOURCE.ContainerNamespace, {
    project_id: project.id,
    name: config.containerNamespace(),
  });
  const container = await scaleway.findOrThrow(RESOURCE.Container, {
    namespace_id: namespace.id,
    name: config.containerName(),
  });

  await scaleway.patch(RESOURCE.Container, container.id, {
    registry_image: registryEndpoint(
      namespace.registry_endpoint,
      config.containerName(),
      input.release
    ),
  });

  await scaleway.waitUntilSuccess(RESOURCE.Container, container.id);
}

if (require.main === module) {
  main();
}
