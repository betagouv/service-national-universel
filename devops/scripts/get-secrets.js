const process = require("node:process");
const UserInput = require("./lib/user-input");
const ScalewayClient = require("./lib/scaleway-client");

function _envMappings(env) {
  switch (env) {
    case "ci":
      return { projectName: "snu-ci", secretName: "snu-ci" };
    case "staging":
      return { projectName: "snu-production", secretName: "snu-staging" };
    case "production":
      return { projectName: "snu-production", secretName: "snu-production" };
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
}

class GetSecrets {
  constructor(scalewayClient, options = {}) {
    this.scaleway = scalewayClient;

    if (options.environment) {
      const { projectName, secretName } = _envMappings(options.environment);
      this.projectName = projectName;
      this.secretName = secretName;
    } else {
      this.projectName = options.projectName;
      this.secretName = options.secretName;
    }
    this.revision = options.revision ?? "latest_enabled";

    this.project = options.project;
  }

  async execute() {
    const project =
      this.project ?? (await this.scaleway.findProject(this.projectName));
    const secrets = await this.scaleway.getSecrets(
      project.id,
      this.secretName,
      this.revision
    );
    return secrets;
  }
}

if (require.main === module) {
  const input = new UserInput(`Build application MonCompte`)
    .arg("environment", "Environment (ci, staging, production)")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();
  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  const secrets = new GetSecrets(scaleway, {
    environment: input.environment,
  })
    .execute()
    .then((secrets) => console.log(secrets));
}

module.exports = GetSecrets;
