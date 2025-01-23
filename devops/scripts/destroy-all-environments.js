const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");

async function main() {
  const input = new UserInput("Delete test environment on Scaleway")
    .optBool("apply-changes", "Disable simulation mode", {shortcut: 'a', default: false})
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  if (!input.applyChanges) {
    console.log("Simulation mode enabled")
  }

  const project = await scaleway.findProject("snu-ci");

  let namespaces = await scaleway.findAll(RESOURCE.ContainerNamespace, {
    project_id: project.id,
  });
  namespaces = namespaces.filter(n => n.name != "snu-ci");

  await Promise.all(namespaces.map(n => {
    console.log(`Deleting environment ${n.name}`);
    if (input.applyChanges) {
      return scaleway.delete(RESOURCE.ContainerNamespace, n.id);
    }
  }))
}

if (require.main === module) {
  main();
}
