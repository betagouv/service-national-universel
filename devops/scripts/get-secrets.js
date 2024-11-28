const UserInput = require("./lib/user-input");
const { ScalewayClient } = require("./lib/scaleway-client");
const { parseEnvFile } = require("./lib/utils");

class GetSecrets {
  constructor(scalewayClient, options = {}) {
    this.scaleway = scalewayClient;

    this.projectName = options.projectName;
    this.secretName = options.secretName;
    this.revision = options.revision ?? "latest_enabled";

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

function formatEnv(secrets) {
  for (const key of Object.keys(secrets)) {
    console.log(`${key}="${secrets[key]}"`);
  }
}

async function main() {
  const input = new UserInput(`Retreive secrets from Scaleway`)
    .arg("project-name", "Project Name")
    .arg("secret-name", "Secret Name")
    .opt("format", "Output format (json | env)", {
      default: "env",
      shortcut: "f",
    })
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();
  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  const secrets = await new GetSecrets(scaleway, input).execute();

  switch (input.format) {
    case "env":
      return formatEnv(secrets);
    case "json":
      return console.log(JSON.stringify(secrets));
  }
}

if (require.main === module) {
  main();
}

module.exports = { GetSecrets };
