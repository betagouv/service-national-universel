const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig } = require("./lib/config");

class DestroyEnvironment {
  constructor(scalewayClient, options = {}) {
    this.scaleway = scalewayClient;
    this.environmentName = options.environmentName;
  }

  async execute() {
    if (this.environmentName === "production") {
      console.log(`Prevent deletion of environment ${this.environmentName}`);
      return;
    } else {
      console.log(`Deleting environment ${this.environmentName}`);
    }

    const config = new EnvConfig(this.environmentName);

    const project = await this.scaleway.findProject(config.projectName());

    const namespace = await this.scaleway.findOrThrow(
      RESOURCE.ContainerNamespace,
      {
        project_id: project.id,
        name: config.containerNamespace(),
      }
    );
    await this.scaleway.delete(RESOURCE.ContainerNamespace, namespace.id);
  }
}

function main() {
  const input = new UserInput("Delete test environment on Scaleway")
    .arg("environment-name", "Environment name")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  new DestroyEnvironment(scaleway, input).execute();
}

if (require.main === module) {
  main();
}

module.exports = DestroyEnvironment;
