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
const CONTAINER_NS_NAME = "snu-staging";

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

async function patchOne(url, body) {
  const resp = await fetch(url, {
    method: "PATCH",
    headers: {
      "X-Auth-Token": SCW_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new Error("Resource not patched", { cause: json.message });
  }
}

async function updateContainer(containerId, body) {
  return patchOne(
    `${SCW_ENDPOINT}/containers/v1beta1/regions/${SCW_REGION}/containers/${containerId}`,
    body
  );
}

async function pauseCI() {
  if (DRY_RUN) {
    console.log("Dry mode enabled");
  }

  const containerNs = await findContainerNamespace(CONTAINER_NS_NAME);
  let containers = await findContainers(containerNs.id);

  containers = containers.filter((c) => {
    const parts = c.name.split("-");
    const name = parts[parts.length - 1];
    return !(name === "api" || name === "tasks");
  });
  if (containers.length) {
    console.log("Pausing containers :");
    for (const container of containers) {
      const payload = {
        privacy: "public",
        // environment_variables: {
        //   ...container.environment_variables,
        //   PILOUP: "true",
        // },
      };
      console.log(container.id, container.name);
      if (!DRY_RUN) {
        await updateContainer(container.id, payload);
      }
    }
  }
}

module.exports = pauseCI;

if (require.main === module) {
  pauseCI();
}
