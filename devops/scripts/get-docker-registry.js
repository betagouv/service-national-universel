const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig } = require("./lib/config");

const SCW_REGISTRY_HOST = "rg.fr-par.scw.cloud";

function getRegistryName(registry) {
  return registry.replace(`${SCW_REGISTRY_HOST}/`, "");
}

class GetRegistry {
  constructor(scalewayClient, options) {
    this.scaleway = scalewayClient;
    this.environment = options.environment;

    this.config = options.config;
    this.project = options.project;
    this.namespace = options.namespace;
  }

  async execute() {
    
    if (["ci", "staging", "production"].includes(this.environment)) {
      return `${SCW_REGISTRY_HOST}/snu-${this.environment}`;
    }

    const config = this.config ?? new EnvConfig(this.environment);

    const project = this.project ?? (
      await this.scaleway.findProject(config.projectName())
    );

    const namespace = this.namespace ?? (
      await this.scaleway.find(RESOURCE.ContainerNamespace, {
      project_id: project.id,
      name: config.containerNamespace(),
    }));

    if (namespace) {
      return namespace.registry_endpoint;
    }
  
    return `local/${this.environment}`;
  }
}

async function main() {
  const input = new UserInput("Get environment registry from environment name")
    .arg("environment", "Environment name")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  const registry = await new GetRegistry(scaleway, input).execute();

  console.log(registry);
}

if (require.main === module) {
  main();
}

module.exports = {
  GetRegistry,
  getRegistryName,
};