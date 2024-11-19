const path = require("node:path");
const { spawn } = require("node:child_process");

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

function registryEndpoint(registry, image, tag) {
  return `${registry}/${image}:${tag}`;
}

function querystring(object) {
  let s = "";
  for (const key in object) {
    s += `&${key}=${object[key]}`;
  }
  return s.replace("&", "?");
}

function includeKeys(object, keys) {
  const result = { ...object };
  for (const key in result) {
    if (!keys.includes(key)) {
      delete result[key];
    }
  }
  return result;
}

function excludeKeys(object, keys) {
  const result = { ...object };
  for (const key in result) {
    if (keys.includes(key)) {
      delete result[key];
    }
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseEnvFile(data) {
  const keys = {};
  for (const line of data.split("\n")) {
    const index = line.indexOf("=");
    if (index > 0) {
      const key = line.substring(0, index);
      const value = line.substring(index + 1).replace(/^"|"$/g, "");
      if (value) {
        keys[key] = value;
      }
    }
  }
  return keys;
}

function childProcess(command, args, options) {
  let proc = spawn(command, args, {
    stdio: "inherit",
    cwd: path.resolve(__dirname, "../../.."), // Project root directory
    ...options,
  });
  return new Promise((resolve, reject) => {
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ChildProcess exited with status ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

function childProcessStdin(command, args, input, options) {
  let proc = spawn(command, args, {
    stdio: ["pipe", "inherit", "inherit"],
    cwd: path.resolve(__dirname, "../../.."), // Project root directory
    ...options,
  });
  return new Promise((resolve, reject) => {
    proc.on("spawn", () => {
      proc.stdin.write(input);
      proc.stdin.end();
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ChildProcess exited with status ${code}`));
      }
    });
    proc.on("error", reject);
  });
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
  sleep,
  environmentFromContainer,
  environmentFromSecret,
  parseRegistryEndpoint,
  registryEndpoint,
  querystring,
  includeKeys,
  excludeKeys,
  genericDeleteAll,
  environmentFromBranch,
  childProcess,
  childProcessStdin,
  parseEnvFile,
};
