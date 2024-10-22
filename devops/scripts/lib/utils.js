const IMAGE_TAG_LENGTH = 9;

function imageTag(commit) {
  return commit.substring(0, IMAGE_TAG_LENGTH);
}

function environmentFromBranch(branchName) {
  return branchName
    .toLowerCase() // lowercase
    .replace(/_/g, "-") // replace _ by -
    .replace(/[^a-z0-9-]/g, "") // remove all except alnum + '-'
    .replace(/-{2,}/g, "-") // merge '-'
    .slice(0, 25) // only 25 first characters
    .replace(/^-|-$/g, ""); // trim '-'
}

function environmentFromContainer(containerName) {
  return containerName.substring(0, containerName.lastIndexOf("-"));
}

function environmentFromSecret(secretName) {
  // secretname starts with "snu-"
  return secretName.substring(4);
}

function parseRegistryEndpoint(endpoint) {
  const parsed = endpoint.split(":");
  return { imageEndpoint: parsed[0], tagName: parsed[1] };
}

async function genericDeleteAll({
  items,
  name,
  logItemCb,
  deleteItemCb,
  getIdCb,
  applyChanges,
}) {
  const deletedItems = [];
  if (items.length) {
    console.log(`Deleting ${name} :`);
    for (const item of items) {
      logItemCb(item);
      try {
        if (applyChanges) {
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

module.exports = {
  imageTag,
  environmentFromContainer,
  environmentFromSecret,
  parseRegistryEndpoint,
  genericDeleteAll,
  environmentFromBranch,
};
