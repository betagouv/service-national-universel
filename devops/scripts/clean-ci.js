function buildEndpointIndex(registryEndpoint, images) {
  const index = {};
  for (const image of images) {
    const id = `${registryEndpoint}/${image.name}`;
    index[id] = image.id;
  }
  return index;
}

function parseRegistryEndpoint(endpoint) {
  const parsed = endpoint.split(":");
  return { imageEndpoint: parsed[0], tagName: parsed[1] };
}

const DEFAULT_LIFETIME = 21;

class CleanCI {
  constructor(client, options = {}) {
    this.client = client;
    this.registryName = options.registryName;
    this.containerNamespace = options.containerNamespace;
    this.dryRun = options.dryRun ?? true;

    const lifetimeDays = options.lifetime ?? DEFAULT_LIFETIME;
    const lifetimeMs = lifetimeDays * 24 * 3600000;
    this.limit = new Date(Date.now() - lifetimeMs).toISOString();
  }

  async run() {
    if (this.dryRun) {
      console.log("Dry mode enabled");
    }

    const registry = await this.client.findRegistry(this.registryName);
    const images = await this.client.findImages(registry.id);

    for (const image of images) {
      let tags = await this.client.findImageTags(image.id);
      tags = tags.filter((t) => t.updated_at < this.limit);

      await this._genericDeleteAll({
        name: `${image.name} image tags`,
        items: tags,
        logItemCb: (i) => console.log(i.id, i.name),
        deleteItemCb: (i) => this.client.deleteImageTag(i.id),
      });
    }

    const containerNs = await this.client.findContainerNamespace(
      this.containerNamespace
    );
    const containers = await this.client.findContainers(containerNs.id);

    const endpoints = buildEndpointIndex(registry.endpoint, images);

    const containersToDelete = await this._getContainersToDelete(
      containers,
      endpoints
    );
    await this._genericDeleteAll({
      name: "containers",
      items: containersToDelete,
      logItemCb: (i) => console.log(i.id, i.name, i.registry_image),
      deleteItemCb: (i) => this.client.deleteContainer(i.id),
    });
  }

  async _genericDeleteAll({ items, name, logItemCb, deleteItemCb }) {
    if (items.length) {
      console.log(`Deleting ${name} :`);
      for (const item of items) {
        logItemCb(item);
        if (!this.dryRun) {
          try {
            await deleteItemCb(item);
          } catch (error) {
            console.error(error.message);
          }
        }
      }
    }
  }

  async _getContainersToDelete(containers, endpoints) {
    const containersToDelete = [];
    for (const container of containers) {
      const { imageEndpoint, tagName } = parseRegistryEndpoint(
        container.registry_image
      );
      const imageId = endpoints[imageEndpoint];
      if (imageId && tagName) {
        const tags = await this.client.findImageTagsByName(imageId, tagName);
        if (!tags.length) {
          containersToDelete.push({
            id: container.id,
            name: container.name,
            registry_image: container.registry_image,
          });
        }
      }
    }
    return containersToDelete;
  }
}

if (require.main === module) {
  const UserInput = require("./lib/user-input");
  const ScalewayClient = require("./lib/scaleway-client");

  const input = new UserInput(
    `Sequentially delete the following resources:
  - Image Tags not updated since <lifetime> days
  - Containers using an image tag that does not exists anymore`
  )
    .arg("registryName", "Name of the docker image registry")
    .arg("containerNamespace", "Container's namespace")
    .optInt(
      "lifetime",
      ["--lifetime"],
      `Number of days without update after which an image tag will be deleted (default: ${DEFAULT_LIFETIME} days)`
    )
    .optBool("dryRun", ["--dry-run"], "Enable Dry Run mode")
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const client = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  new CleanCI(client, input).run();
}

module.exports = {
  CleanCI,
};
