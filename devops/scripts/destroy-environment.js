const {
  environmentFromContainer,
  environmentFromSecret,
  genericDeleteAll,
} = require("./lib/utils");
const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");

class DestroyEnvironments {
  constructor(scalewayClient, options = {}) {
    this.scaleway = scalewayClient;
    this.applyChanges = options.applyChanges;
    this.namespaceName = options.namespaceName;
    this.environments = new Set(options.environments);

    this.namespace = options.namespace;
    this.containers = options.containers;
  }

  async _deleteSecrets(projectId) {
    const secrets = await this.scaleway.findAll(RESOURCE.Secret, {
      project_id: projectId,
      page_size: 100,
    });
    const deletableSecrets = secrets.filter((i) =>
      this.environments.has(environmentFromSecret(i.name))
    );
    await genericDeleteAll({
      name: "secrets",
      items: deletableSecrets,
      logItemCb: (i) => console.log(i.id, i.name),
      deleteItemCb: (i) => this.scaleway.delete(RESOURCE.Secret, i.id),
      getIdCb: (i) => i.id,
      applyChanges: this.applyChanges,
    });
  }

  async _deleteContainers(containers) {
    const deletableContainers = containers.filter((i) =>
      this.environments.has(environmentFromContainer(i.name))
    );
    return await genericDeleteAll({
      name: "containers",
      items: deletableContainers,
      logItemCb: (i) => console.log(i.id, i.name, i.registry_image),
      deleteItemCb: (i) => this.scaleway.delete(RESOURCE.Container, i.id),
      getIdCb: (i) => i.id,
      applyChanges: this.applyChanges,
    });
  }

  async execute() {
    console.log("Trying to delete these environments: ");
    this.environments.forEach((i) => console.log(" - " + i));

    const project = await this.scaleway.findProject("snu-ci");

    const namespace =
      this.namespace ??
      (await this.scaleway.findOne(RESOURCE.ContainerNamespace, {
        project_id: project.id,
        name: this.namespaceName,
      }));
    const containers =
      this.containers ??
      (await this.scaleway.findAll(RESOURCE.Container, {
        namespace_id: namespace.id,
        page_size: 100,
      }));

    await this._deleteContainers(containers);
    await this._deleteSecrets(project.id);
  }
}

function main() {
  const input = new UserInput(
    `Sequentially delete the following resources:
    - Containers whose name begins with <environment>
    - Secrets whose name equals "snu-<environment>"`
  )
    .arg("namespace-name", "Container's namespace")
    .multiple("environments", "Name of the environments to delete")
    .optBool("apply-changes", "Apply listed changes on infrastructure", {
      default: false,
    })
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  if (!input.applyChanges) {
    console.log("Changes won't be applied as applyChanges option is disabled");
  }

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  new DestroyEnvironments(scaleway, input).execute();
}

if (require.main === module) {
  main();
}

module.exports = DestroyEnvironments;
