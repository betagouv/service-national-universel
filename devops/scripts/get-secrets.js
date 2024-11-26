const UserInput = require("./lib/user-input");
const { ScalewayClient } = require("./lib/scaleway-client");
const { parseEnvFile } = require("./lib/utils");

class GetSecrets {
  constructor(scalewayClient, options = {}) {
    this.scaleway = scalewayClient;

    this.projectName = options.projectName;
    this.secretName = options.secretName;
    this.revision = options.revision ?? "latest_enabled";
    this.format = options.format;

    this.project = options.project;
  }

  async execute() {
    const project =
      this.project ?? (await this.scaleway.findProject(this.projectName));
    return await this.scaleway.getSecrets(
      project.id,
      this.secretName,
      this.revision
    );
  }
}

async function main() {
  const input = new UserInput(`Retreive secrets from Scaleway`)
    .arg("project-name", "Project Name")
    .arg("secret-name", "Secret Name")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();
  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  const secrets = await new GetSecrets(scaleway, input).execute();

  for (const key of Object.keys(secrets)) {
    console.log(`${key}="${secrets[key]}"`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { GetSecrets };
