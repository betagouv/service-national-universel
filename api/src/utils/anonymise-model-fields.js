// Récupère la valeur d'un champ imbriqué dans un objet en suivant un chemin donné (ex: schoolLocation.lat)
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

// Définit une valeur à un champ imbriqué dans un objet en suivant un chemin donné (ex: schoolLocation.lat)
function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const deepObj = keys.reduce((acc, key) => (acc[key] = acc[key] || {}), obj);
  deepObj[lastKey] = value;
}

// Génère tous les chemins de propriétés possibles dans un objet, y compris les objets imbriqués
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

// Anonymise tous les champs d'un objet qui ne sont pas dans la whitelist
function anonymizeNonDeclaredFields(item, whitelist) {
  const allPaths = getAllPaths(item);

  for (const path of allPaths) {
    if (!whitelist.includes(path)) {
      const value = getNestedValue(item, path);

      if (Array.isArray(value) && value.length > 0) {
        // Si le tableau contient des objets, anonymise chaque objet
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
        } else if (path.includes("$date")) {
          setNestedValue(item, path, new Date());
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
