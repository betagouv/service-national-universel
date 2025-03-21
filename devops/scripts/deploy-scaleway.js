const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { AppConfig } = require("./lib/config");
const { registryEndpoint } = require("./lib/utils");
const { GetRegistry } = require("./get-docker-registry");

async function main() {
  const input = new UserInput(`Deploy application on Scaleway`)
    .arg("environment", "Environment (ci, staging, production)")
    .arg("application", "Application (app, admin, api, apiv2, tasks, tasksv2)")
    .arg("release", "Release")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  const config = new AppConfig(input.environment, input.application);

  const project = await scaleway.findProject(config.projectName());

  const namespace = await scaleway.findOrThrow(RESOURCE.ContainerNamespace, {
    project_id: project.id,
    name: config.containerNamespace(),
  });
  const container = await scaleway.findOrThrow(RESOURCE.Container, {
    namespace_id: namespace.id,
    name: config.containerName(),
  });

  const registry = await new GetRegistry(this.scaleway, {
    environment: input.environment,
    config,
    project,
    namespace,
  }).execute();

  const imageUrl = registryEndpoint(
    registry,
    config.imageName(),
    input.release
  );

  if (container.status !== "error" && container.registry_image === imageUrl) {
    console.log(`${imageUrl} is already deployed on ${container.name}`);
    return;
  }

  console.log(`Deploying ${imageUrl} on ${container.name}`);

  await scaleway.patch(RESOURCE.Container, container.id, {
    registry_image: imageUrl,
  });

  await scaleway.waitUntilStatus(RESOURCE.Container, container.id, ["ready"]);
}

if (require.main === module) {
  main();
}
