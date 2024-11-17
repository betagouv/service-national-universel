const { registryEndpoint } = require("./lib/utils");
const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig, AppConfig } = require("./lib/config");

class CreateEnvironment {
  constructor(scalewayClient, options = {}) {
    this.scaleway = scalewayClient;
    this.environmentName = options.environmentName;
  }

  async _createContainer(namespace, application) {
    const config = new AppConfig(this.environmentName, application);
    let secrets = {};

    const secretName = config.runSecretName();
    if (secretName) {
      secrets = await this.scaleway.getSecrets(
        namespace.project_id,
        secretName,
        "latest_enabled"
      );
    }

    const options = await config.containerOptions();
    const container = await this.scaleway.create(RESOURCE.Container, {
      ...options,
      name: config.containerName(),
      namespace_id: namespace.id,
      registry_image: registryEndpoint(config.registry(), "latest"),
      environment_variables: secrets,
    });

    await this.scaleway.action(RESOURCE.Container, container.id, "deploy");

    await this.scaleway.waitUntilSuccess(RESOURCE.Container, container.id);

    return container;
  }

  async execute() {
    console.log(`Creating environment ${this.environmentName} `);

    const config = new EnvConfig(this.environmentName);

    const project = await this.scaleway.findProject(config.projectName());

    const key = {
      project_id: project.id,
      name: config.containerNamespace(),
    };
    let namespace = await this.scaleway.find(RESOURCE.ContainerNamespace, key);
    if (namespace) {
      console.log(`Namespace ${namespace.name} already existing.`);
      return;
    }

    namespace = await this.scaleway.create(RESOURCE.ContainerNamespace, key);

    await this.scaleway.waitUntilSuccess(
      RESOURCE.ContainerNamespace,
      namespace.id
    );

    await Promise.all(
      ["api", "app", "admin"].map((app) =>
        this._createContainer(namespace, app)
      )
    );
  }
}

function main() {
  const input = new UserInput(`Create test environment on scaleway`)
    .arg("environment-name", "Environment name")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  new CreateEnvironment(scaleway, input).execute();
}

if (require.main === module) {
  main();
}

module.exports = CreateEnvironment;
