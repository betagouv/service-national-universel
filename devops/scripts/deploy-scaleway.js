const UserInput = require("./lib/user-input");
const { ScalewayClient } = require("./lib/scaleway-client");
const { Config } = require("./lib/config");
const { registryEndpoint, sleep } = require("./lib/utils");

const POLL_INTERVAL_MS = 5000;

async function waitUntilSuccess(scaleway, containerId) {
  let container;
  do {
    await sleep(POLL_INTERVAL_MS);
    container = await scaleway.getContainer(containerId);
    if (container.status === "error") {
      throw new Error(container.error_message);
    }
  } while (container.status === "pending");
}

async function main() {
  const input = new UserInput(`Build application MonCompte`)
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
  const config = new Config(input.environment, input.application);

  const namespace = await scaleway.findContainerNamespace(
    config.containerNamespace()
  );
  const container = await scaleway.findContainer(
    namespace.id,
    config.containerName()
  );

  await scaleway.updateContainer(container.id, {
    registry_image: registryEndpoint(config.registry(), input.release),
  });

  await waitUntilSuccess(scaleway, container.id);
}

if (require.main === module) {
  main();
}
