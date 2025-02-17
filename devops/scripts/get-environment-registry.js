const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig } = require("./lib/config");

async function main() {
  const input = new UserInput("Get environment registry from environment name")
    .arg("environment-name", "Environment name")
    .validate();

  const config = new EnvConfig(input.environmentName);

  console.log(config.dockerRegistry());
}

if (require.main === module) {
  main();
}
