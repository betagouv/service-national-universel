const UserInput = require("./lib/user-input");
const { ScalewayClient, RESOURCE } = require("./lib/scaleway-client");
const { EnvConfig } = require("./lib/config");
const { GetRegistry, getRegistryName } = require("./get-docker-registry");

class CleanRegistry {
    constructor(scalewayClient, options) {
        this.scaleway = scalewayClient;
        this.environment = options.environment;
        this.applyChanges = options.applyChanges;
        this.keepCount = options.keepCount;

        const lifetimeMs = options.lifetime * 24 * 3600000;
        this.limit = new Date(Date.now() - lifetimeMs).toISOString();
      }

    async _process_image(image) {
        console.log(`Processing image ${image.name}`)

        let page = 1;
        const tags = [];
      
        while (true) {
          const items = await this.scaleway.findAll(RESOURCE.Image.Tag, {
              image_id: image.id,
              page: page,
              page_size: 100,
          });
          if (!items.length) {
              break;
          }
          tags.push(...items.map(i => ({id: i.id, updated_at: i.updated_at})))
          page += 1;
        }
      
      
        tags.sort((a, b) => a.updated_at.localeCompare(b.updated_at) );
      
        let validCount = tags.reduce((acc, i) => acc + Number(i.updated_at >= this.limit), 0);
        validCount = Math.max(validCount, this.keepCount);
        
        const validTags = tags.splice(-validCount);
        console.log(`${tags.length} tags to delete - ${validTags.length} tags to keep`)
      
      
        for (const tag of tags) {
            console.log(`Deleting tag ${tag.id} last updated at ${tag.updated_at}`);
            if (this.applyChanges) {
              await this.scaleway.delete(RESOURCE.ImageTag, tag.id);
            }
        }
    }

    async execute() {
        if (!this.applyChanges) {
            console.log("Simulation mode enabled")
        }

        const config = new EnvConfig(this.environment);

        const project = await this.scaleway.findProject(config.projectName());

        const registry = await new GetRegistry(this.scaleway, {
          environment: this.environment,
          config: this.config,
          project,
        }).execute();
      
      
        const namespace = await this.scaleway.findOrThrow(RESOURCE.RegistryNamespace, {
          project_id: project.id,
          name: getRegistryName(registry),
        });
      
        const images = await this.scaleway.findAll(RESOURCE.Image, {
          namespace_id: namespace.id
        })

        for (const image of images) {
            await this._process_image(image);
        }
    }
}

async function main() {
  const input = new UserInput("Delete outdated docker image tags")
    .arg("environment", "Environment (ci, staging, production, development)")
    .optInt(
        "lifetime",
        `Number of days without update after which an image tag will be deleted`,
        { default: 14, shortcut: "l" }
      )
    .optInt(
      "keep-count",
      `Minimum number of most recent image tags to keep`,
      { default: 10, shortcut: "k" }
    )
    .optBool("apply-changes", "Disable simulation mode", {shortcut: 'a', default: false})
    .env("SCW_SECRET_KEY", "Scaleway secret key")
    .env("SCW_ORGANIZATION_ID", "Scaleway organization identifier")
    .validate();

  const scaleway = new ScalewayClient(
    input.SCW_SECRET_KEY,
    input.SCW_ORGANIZATION_ID
  );

  await new CleanRegistry(scaleway, input).execute();
}

if (require.main === module) {
  main();
}
