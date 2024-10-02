function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const deepObj = keys.reduce((acc, key) => (acc[key] = acc[key] || {}), obj);
  deepObj[lastKey] = value;
}

function getAllPaths(obj, parentPath = "") {
  let paths = [];
  for (let key in obj) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      paths = paths.concat(getAllPaths(obj[key], currentPath));
    } else {
      paths.push(currentPath);
    }
  }
  return paths;
}

function anonymizeNonDeclaredFields(item, whitelist) {
  const allPaths = getAllPaths(item);

  for (const path of allPaths) {
    if (!whitelist.includes(path)) {
      const value = getNestedValue(item, path);

      if (Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === "object") {
          value.forEach((element, index) => {
            value[index] = anonymizeNonDeclaredFields(element, whitelist);
          });
        } else {
          setNestedValue(item, path, []);
        }
        continue;
      }

      if (value !== undefined) {
        if (Array.isArray(value)) {
          setNestedValue(item, path, []);
        } else if (typeof value === "string") {
          setNestedValue(item, path, "");
        } else {
          setNestedValue(item, path, null);
        }
      }
    }
  }

  return item;
}

module.exports = {
  anonymizeNonDeclaredFields,
};
