const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { AppConfig } = require("./lib/config");

async function main() {
  const input = new UserInput(
    `Update container runtime configuration from secrets (Scaleway)`
  )
    .arg("environment", "Environment (ci, staging, production)")
    .arg("application", "Application (app, admin, api, apiv2, tasks, tasksv2)")
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

  const secretName = config.runSecretName();
  if (!secretName) {
    console.log(
      `The application ${container.name} has no runtime configuration`
    );
    return;
  }

  const secrets = await scaleway.getSecrets(
    project.id,
    secretName,
    "latest_enabled"
  );

  console.log(
    `Updating environment variables on ${container.name} from secret ${secretName}`
  );

  await scaleway.patch(RESOURCE.Container, container.id, {
    environment_variables: {
      ...secrets,
      ...config.runEnvVariables(namespace.registry_endpoint),
    },
  });

  await scaleway.waitUntilStatus(RESOURCE.Container, container.id, ["ready"]);
}

if (require.main === module) {
  main();
}
