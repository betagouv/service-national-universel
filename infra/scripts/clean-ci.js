const { env } = require("node:process");

function getEnv(name) {
  const value = env[name];
  if (!value) {
    throw new Error("A required environment variable is not set", {
      cause: name,
    });
  }
  return value;
}

const DRY_RUN = false;
const SCW_SECRET_KEY = getEnv("SCW_SECRET_KEY");
const SCW_REGION = "fr-par";
const SCW_ENDPOINT = "https://api.scaleway.com";
const REGISTRY_NAME = "snu-ci";
const CONTAINER_NS_NAME = "snu-custom";
const LIFETIME_MS = 3 * 7 * 24 * 3600000; // 3 weeks

async function findOne(url, listName) {
  const resp = await fetch(url, {
    headers: { "X-Auth-Token": SCW_SECRET_KEY },
  });
  const json = await resp.json();
  if (resp.ok) {
    if (json.total_count == 1) {
      return json[listName][0];
    }
    throw new Error("Resource not found");
  }
  throw new Error("Resource not found", { cause: json.message });
}

async function findAll(url, listName) {
  const resp = await fetch(url, {
    headers: { "X-Auth-Token": SCW_SECRET_KEY },
  });
  const json = await resp.json();
  if (resp.ok) {
    return json[listName];
  }
  throw new Error("Resource not found", { cause: json.message });
}

async function deleteOne(url) {
  const resp = await fetch(url, {
    method: "delete",
    headers: { "X-Auth-Token": SCW_SECRET_KEY },
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error("Resource not deleted", { cause: json.message });
  }
}

async function deleteImageTag(tagId) {
  return deleteOne(
    `${SCW_ENDPOINT}/registry/v1/regions/${SCW_REGION}/tags/${tagId}`
  );
}

async function deleteContainer(containerId) {
  return deleteOne(
    `${SCW_ENDPOINT}/containers/v1beta1/regions/${SCW_REGION}/containers/${containerId}`
  );
}

async function findRegistry(name) {
  return findOne(
    `${SCW_ENDPOINT}/registry/v1/regions/${SCW_REGION}/namespaces?name=${name}`,
    "namespaces"
  );
}

async function findContainerNamespace(name) {
  return findOne(
    `${SCW_ENDPOINT}/containers/v1beta1/regions/${SCW_REGION}/namespaces?name=${name}`,
    "namespaces"
  );
}

async function findContainers(namespaceId) {
  return findAll(
    `${SCW_ENDPOINT}/containers/v1beta1/regions/${SCW_REGION}/containers?namespace_id=${namespaceId}&page_size=100`,
    "containers"
  );
}

async function findImages(registryId) {
  return findAll(
    `${SCW_ENDPOINT}/registry/v1/regions/${SCW_REGION}/images?namespace_id=${registryId}`,
    "images"
  );
}

async function findImageTags(imageId) {
  return findAll(
    `${SCW_ENDPOINT}/registry/v1/regions/${SCW_REGION}/images/${imageId}/tags?order_by=created_at_asc&page_size=100`,
    "tags"
  );
}

async function findImageTagsByName(imageId, name) {
  return findAll(
    `${SCW_ENDPOINT}/registry/v1/regions/${SCW_REGION}/images/${imageId}/tags?name=${name}`,
    "tags"
  );
}

async function genericDeleteAll({ items, name, logItemCb, deleteItemCb }) {
  if (items.length) {
    console.log(`Deleting ${name} :`);
    for (const item of items) {
      logItemCb(item);
      if (!DRY_RUN) {
        try {
          await deleteItemCb(item);
        } catch (error) {
          console.error(error.message);
        }
      }
    }
  }
}

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

async function getContainersToDelete(containers, endpoints) {
  const containersToDelete = [];
  for (const container of containers) {
    const { imageEndpoint, tagName } = parseRegistryEndpoint(
      container.registry_image
    );
    const imageId = endpoints[imageEndpoint];
    if (imageId && tagName) {
      const tags = await findImageTagsByName(imageId, tagName);
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

async function cleanCI() {
  if (DRY_RUN) {
    console.log("Dry mode enabled");
  }
  const limit = new Date(Date.now() - LIFETIME_MS).toISOString();

  const registry = await findRegistry(REGISTRY_NAME);
  const images = await findImages(registry.id);

  for (const image of images) {
    let tags = await findImageTags(image.id);
    tags = tags.filter((t) => t.updated_at < limit);

    await genericDeleteAll({
      name: `${image.name} image tags`,
      items: tags,
      logItemCb: (i) => console.log(i.id, i.name),
      deleteItemCb: (i) => deleteImageTag(i.id),
    });
  }

  const containerNs = await findContainerNamespace(CONTAINER_NS_NAME);
  const containers = await findContainers(containerNs.id);

  const endpoints = buildEndpointIndex(registry.endpoint, images);

  const containersToDelete = await getContainersToDelete(containers, endpoints);
  await genericDeleteAll({
    name: "containers",
    items: containersToDelete,
    logItemCb: (i) => console.log(i.id, i.name, i.registry_image),
    deleteItemCb: (i) => deleteContainer(i.id),
  });
}

module.exports = cleanCI;

if (require.main === module) {
  cleanCI();
}
