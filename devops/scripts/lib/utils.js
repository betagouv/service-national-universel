const IMAGE_TAG_LENGTH = 9;

function imageTag(commit) {
  return commit.substring(0, IMAGE_TAG_LENGTH);
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

module.exports = {
  imageTag,
  environmentFromContainer,
  environmentFromSecret,
  parseRegistryEndpoint,
};
