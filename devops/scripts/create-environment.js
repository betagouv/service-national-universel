const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig, AppConfig } = require("./lib/config");

class CreateEnvironment {
  constructor(scalewayClient, options = {}) {
    this.scaleway = scalewayClient;
    this.environmentName = options.environmentName;
  }

  async createContainer(namespace, config, key) {
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
    let container = await this.scaleway.create(RESOURCE.Container, {
      ...options,
      environment_variables: {
        ...secrets,
        ...config.runEnvVariables(namespace.registry_endpoint),
      },
      ...key,
    });

    container = await this.scaleway.waitUntilStatus(
      RESOURCE.Container,
      container.id,
      ["ready", "created"]
    );

    return container;
  }

  async findOrCreateContainer(namespace, application) {
    const config = new AppConfig(this.environmentName, application);

    const key = {
      name: config.containerName(),
      namespace_id: namespace.id,
    };
    let container = await this.scaleway.find(RESOURCE.Container, key);
    if (container) {
      console.log(`Container ${key.name} already existing`);
    } else {
      console.log(`Creating container ${key.name}`);
      container = await this.createContainer(namespace, config, key);
    }
    return container;
  }

  async findOrCreateNamespace(key) {
    let namespace = await this.scaleway.find(RESOURCE.ContainerNamespace, key);
    if (namespace) {
      console.log(`Namespace ${key.name} already existing`);
    } else {
      console.log(`Creating namespace ${key.name}`);
      namespace = await this.scaleway.create(RESOURCE.ContainerNamespace, key);

      namespace = await this.scaleway.waitUntilStatus(
        RESOURCE.ContainerNamespace,
        namespace.id,
        ["ready"]
      );
    }
    return namespace;
  }

  async execute() {
    console.log(`Creating environment ${this.environmentName} `);

    const config = new EnvConfig(this.environmentName);

    const project = await this.scaleway.findProject(config.projectName());

    const namespace = await this.findOrCreateNamespace({
      project_id: project.id,
      name: config.containerNamespace(),
    });

    await Promise.all(
      ["app", "admin", "api", "apiv2"].map((app) =>
        this.findOrCreateContainer(namespace, app)
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
