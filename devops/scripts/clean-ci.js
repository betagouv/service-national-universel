const {
  imageTag,
  environmentFromContainer,
  environmentFromSecret,
  parseRegistryEndpoint,
} = require("./lib/utils");

function buildEndpointIndex(registryEndpoint, images) {
  const index = {};
  for (const image of images) {
    const id = `${registryEndpoint}/${image.name}`;
    index[id] = image.id;
  }
  return index;
}

class CleanCI {
  constructor(scalewayClient, githubClient, options = {}) {
    this.scaleway = scalewayClient;
    this.github = githubClient;
    this.registryName = options.registryName;
    this.containerNamespace = options.containerNamespace;
    this.applyChanges = options.applyChanges;

    const lifetimeDays = options.lifetime;
    const lifetimeMs = lifetimeDays * 24 * 3600000;
    this.limit = new Date(Date.now() - lifetimeMs).toISOString();
  }

  async _deleteImageTags(images) {
    const deletableTags = await this._getDeletableImageTags();
    let deletedItems = [];

    for (const image of images) {
      let tags = await this.scaleway.findImageTags(image.id);
      tags = tags.filter(
        (t) =>
          t.name !== "latest" &&
          (t.updated_at < this.limit || deletableTags.has(t.name))
      );

      const items = await this._genericDeleteAll({
        name: `${image.name} image tags`,
        items: tags,
        logItemCb: (i) => console.log(i.id, i.name),
        deleteItemCb: (i) => this.scaleway.deleteImageTag(i.id),
        getIdCb: (i) => i.name,
      });
      deletedItems = deletedItems.concat(items);
    }
    return new Set(deletedItems);
  }

  async _deleteSecrets(projectId, environments) {
    const secrets = await this.scaleway.findSecrets(projectId);
    const deletableSecrets = secrets.filter((i) =>
      environments.has(environmentFromSecret(i.name))
    );
    await this._genericDeleteAll({
      name: "secrets",
      items: deletableSecrets,
      logItemCb: (i) => console.log(i.id, i.name),
      deleteItemCb: (i) => this.scaleway.deleteSecret(i.id),
      getIdCb: (i) => i.id,
    });
  }

  async _deleteContainers(containers, environments) {
    const deletableContainers = containers.filter((i) =>
      environments.has(environmentFromContainer(i.name))
    );
    return await this._genericDeleteAll({
      name: "containers",
      items: deletableContainers,
      logItemCb: (i) => console.log(i.id, i.name, i.registry_image),
      deleteItemCb: (i) => this.scaleway.deleteContainer(i.id),
      getIdCb: (i) => i.id,
    });
  }

  async run() {
    if (!this.applyChanges) {
      console.log(
        "Changes won't be applied as applyChanges option is disabled"
      );
    }

    const registry = await this.scaleway.findRegistry(this.registryName);
    const images = await this.scaleway.findImages(registry.id);

    const deletedTags = await this._deleteImageTags(images);

    const containerNs = await this.scaleway.findContainerNamespace(
      this.containerNamespace
    );
    const containers = await this.scaleway.findContainers(containerNs.id);
    const endpoints = buildEndpointIndex(registry.endpoint, images);

    const environments = await this._getDeletableEnvironments(
      deletedTags,
      containers,
      endpoints
    );
    if (environments.size) {
      console.log("The following environments will be deleted: ");
      environments.forEach((i) => console.log(" - " + i));
    }

    await this._deleteContainers(containers, environments);
    await this._deleteSecrets(containerNs.project_id, environments);
  }

  async _genericDeleteAll({ items, name, logItemCb, deleteItemCb, getIdCb }) {
    const deletedItems = [];
    if (items.length) {
      console.log(`Deleting ${name} :`);
      for (const item of items) {
        logItemCb(item);
        try {
          if (this.applyChanges) {
            await deleteItemCb(item);
          }
          deletedItems.push(getIdCb(item));
        } catch (error) {
          console.error(error.message);
        }
      }
    }
    return deletedItems;
  }

  async _getDeletableImageTags() {
    console.log("Retreiving commits for Pull Request recently closed :");
    const prs = await this.github.findRecentlyUpdatedPullRequests(
      "main",
      "closed"
    );
    const tags = new Set();
    for (const pr of prs) {
      console.log(` - #${pr.number}: ${pr.title} (${pr.url})`);
      const commits = await this.github._findAll(
        pr.commits_url + "?per_page=100"
      );
      commits.forEach((i) => tags.add(imageTag(i.sha)));
    }
    return tags;
  }

  async _getDeletableEnvironments(deletedTags, containers, endpoints) {
    const environments = new Set();
    for (const container of containers) {
      const { imageEndpoint, tagName } = parseRegistryEndpoint(
        container.registry_image
      );
      if (deletedTags.has(tagName)) {
        environments.add(environmentFromContainer(container.name));
        continue;
      }
      const imageId = endpoints[imageEndpoint];
      if (imageId && tagName) {
        const tags = await this.scaleway.findImageTagsByName(imageId, tagName);
        if (!tags.length) {
          environments.add(environmentFromContainer(container.name));
        }
      }
    }
    return environments;
  }
}

if (require.main === module) {
  const UserInput = require("./lib/user-input");
  const ScalewayClient = require("./lib/scaleway-client");
  const GithubClient = require("./lib/github-client");

  const input = new UserInput(
    `Sequentially delete the following resources:
  - Image Tags not updated since <lifetime> days
  - Containers using an image tag that does not exists anymore`
  )
    .arg("registry-name", "Name of the docker image registry")
    .arg("container-namespace", "Container's namespace")
    .optInt(
      "lifetime",
      `Number of days without update after which an image tag will be deleted`,
      { default: 21, shortcut: "l" }
    )
    .optBool("apply-changes", "Apply listed changes on infrastructure", {
      default: false,
    })
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .env("GITHUB_TOKEN", "Github access token")
    .validate();

  const github = new GithubClient(input.GITHUB_TOKEN);
  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  new CleanCI(scaleway, github, input).run();
}

module.exports = {
  CleanCI,
};
