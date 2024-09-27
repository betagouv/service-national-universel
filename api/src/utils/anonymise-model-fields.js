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

      // Si le champ est un tableau d'objets, on le laisse intact
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        continue;
      }

      // Anonymisation des champs non listés dans la whitelist
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

  console.log("Anonymized Item:", item);
  return item;
}

module.exports = {
  anonymizeNonDeclaredFields,
};
