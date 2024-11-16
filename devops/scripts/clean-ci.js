const {
  imageTag,
  environmentFromContainer,
  parseRegistryEndpoint,
  genericDeleteAll,
} = require("./lib/utils");
const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const GithubClient = require("./lib/github-client");
const DestroyEnvironments = require("./destroy-environment");

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
    this.applyChanges = options.applyChanges;
    this.projectName = options.projectName;
    this.namespaceName = options.namespaceName;

    const lifetimeDays = options.lifetime;
    const lifetimeMs = lifetimeDays * 24 * 3600000;
    this.limit = new Date(Date.now() - lifetimeMs).toISOString();
  }

  async _deleteImageTags(images) {
    const deletableTags = new Set(await this._getDeletableImageTags());
    let deletedItems = [];

    for (const image of images) {
      let tags = await this.scaleway.findAll(RESOURCE.Image.Tag, {
        image_id: image.id,
        order_by: "created_at_asc",
        page_size: 100,
      });
      tags = tags.filter(
        (t) =>
          t.name !== "latest" &&
          (t.updated_at < this.limit || deletableTags.has(t.name))
      );

      const items = await genericDeleteAll({
        name: `${image.name} image tags`,
        items: tags,
        logItemCb: (i) => console.log(i.id, i.name),
        deleteItemCb: (i) => this.scaleway.delete(RESOURCE.ImageTag, i.id),
        getIdCb: (i) => i.name,
        applyChanges: this.applyChanges,
      });
      deletedItems = deletedItems.concat(items);
    }
    return deletedItems;
  }

  async execute() {
    const project = await this.scaleway.findProject(this.projectName);
    const registry = await this.scaleway.findOne(RESOURCE.RegistryNamespace, {
      project_id: project.id,
      name: this.projectName,
    });
    const images = await this.scaleway.findAll(RESOURCE.Image, {
      namespace_id: registry.id,
    });

    const deletedTags = await this._deleteImageTags(images);

    const namespace = await this.scaleway.findOne(RESOURCE.ContainerNamespace, {
      project_id: project.id,
      name: this.namespaceName,
    });
    const containers = await this.scaleway.findAll(RESOURCE.Container, {
      namespace_id: namespace.id,
      page_size: 100,
    });
    const endpoints = buildEndpointIndex(registry.endpoint, images);

    const environments = await this._getDeletableEnvironments(
      deletedTags,
      containers,
      endpoints
    );
    if (environments.length) {
      await new DestroyEnvironments(this.scaleway, {
        namespace,
        containers,
        environments,
        namespaceName: this.namespaceName,
        applyChanges: this.applyChanges,
      }).execute();
    }
  }

  async _getDeletableImageTags() {
    console.log("Retreiving commits for Pull Request recently closed :");
    const prs = await this.github.findRecentlyUpdatedPullRequests(
      "main",
      "closed"
    );
    const tags = [];
    for (const pr of prs) {
      console.log(` - #${pr.number}: ${pr.title} (${pr.url})`);
      const commits = await this.github._findAll(
        pr.commits_url + "?per_page=100"
      );
      commits.forEach((i) => tags.push(imageTag(i.sha)));
    }
    return tags;
  }

  async _getDeletableEnvironments(deletedTags, containers, endpoints) {
    deletedTags = new Set(deletedTags);
    const environments = [];
    for (const container of containers) {
      const envName = environmentFromContainer(container.name);
      const { imageEndpoint, tagName } = parseRegistryEndpoint(
        container.registry_image
      );
      if (deletedTags.has(tagName)) {
        environments.push(envName);
        continue;
      }
      const imageId = endpoints[imageEndpoint];
      if (imageId && tagName) {
        const tags = await this.scaleway.findAll(RESOURCE.Image.Tag, {
          image_id: imageId,
          name: tagName,
        });
        if (!tags.length) {
          environments.push(envName);
        }
      }
    }
    return environments;
  }
}

function main() {
  const input = new UserInput(
    `Sequentially delete the following resources:
  - Image Tags not updated since <lifetime> days
  - Containers using an image tag that does not exists anymore`
  )
    .arg("project-name", "Project name")
    .arg("namespace-name", "Container's namespace")
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

  if (!input.applyChanges) {
    console.log("Changes won't be applied as applyChanges option is disabled");
  }

  const github = new GithubClient(input.GITHUB_TOKEN);
  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );
  new CleanCI(scaleway, github, input).execute();
}

if (require.main === module) {
  main();
}

module.exports = CleanCI;
