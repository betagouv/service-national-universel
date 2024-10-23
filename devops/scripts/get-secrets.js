const process = require("node:process");
const UserInput = require("./lib/user-input");
const ScalewayClient = require("./lib/scaleway-client");
const { format } = require("node:path");

const SECRET_FORMATS = {
  JSON: "json",
  ENVFILE: "envfile",
};

function _parseSecret(format, data) {
  switch (format) {
    case SECRET_FORMATS.JSON:
      return JSON.parse(data);
    case SECRET_FORMATS.ENVFILE:
      return parseEnvFile(data);
      break;
    default:
      throw new Error("Unknown secret format");
  }
}

function parseEnvFile(data) {
  const keys = {};
  for (const line of data.split("\n")) {
    const index = line.indexOf("=");
    if (index > 0) {
      const key = line.substring(0, index);
      const value = line.substring(index + 1).replace(/^"|"$/g, "");
      if (value) {
        keys[key] = value;
      }
    }
  }
  return keys;
}

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
    const data = await this.scaleway.getSecrets(
      project.id,
      this.secretName,
      this.revision
    );
    return _parseSecret(this.format, data);
  }
}

async function main() {
  const input = new UserInput(`Retreive secrets from Scaleway`)
    .arg("project-name", "Project Name")
    .arg("secret-name", "Secret Name")
    .opt(
      "format",
      `Format of the secret file (${SECRET_FORMATS.JSON}, ${SECRET_FORMATS.ENVFILE})`,
      {
        default: SECRET_FORMATS.JSON,
        shortcut: "f",
      }
    )
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

module.exports = { GetSecrets, SECRET_FORMATS };
