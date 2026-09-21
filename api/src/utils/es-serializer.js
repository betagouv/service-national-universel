const { ES_YOUNG_SENSITIVE_FIELDS, ES_REFERENT_SENSITIVE_FIELDS } = require("snu-lib");

/**
 * Applique `callback` à tous les `_source` d'une réponse Elasticsearch, quelle
 * que soit sa forme : tableau de documents déjà aplatis (`allRecords`), réponse
 * `_msearch` (`body.responses[]`), réponse `search` simple (`body.hits.hits`) et
 * `_source` imbriqués dans les agrégations (`top_hits`).
 *
 * Les formes imbriquées comptent : une agrégation `top_hits` renvoie le document
 * complet sans passer par `hits.hits` de premier niveau.
 */
function serializeHits(body, callback) {
  // Tableau de documents déjà aplatis (sortie de allRecords).
  if (Array.isArray(body)) {
    return body.map((doc) => (doc && typeof doc === "object" ? callback(doc) : doc));
  }
  if (!body || typeof body !== "object") return body;
  return mapSources(body, callback);
}

/** Parcourt récursivement la réponse et remplace chaque `_source` rencontré. */
function mapSources(node, callback) {
  if (Array.isArray(node)) return node.map((item) => mapSources(item, callback));
  if (!node || typeof node !== "object") return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "_source" && value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = callback(value);
    } else {
      out[key] = mapSources(value, callback);
    }
  }
  return out;
}

/** Retire les champs de `fields` d'un document. */
function omit(fields) {
  return (doc) => {
    const out = { ...doc };
    for (const field of fields) delete out[field];
    return out;
  };
}

function serializeMissions(body) {
  return serializeHits(body, (hit) => hit);
}

function serializeSchools(body) {
  return serializeHits(body, (hit) => {
    return {
      type: hit.type,
      department: hit.department,
      city: hit.city,
      postcode: hit.postcode,
      name2: hit.name2,
      fullName: hit.fullName,
      uai: hit.uai,
    };
  });
}

function serializeRamsesSchools(body) {
  return serializeHits(body, (hit) => {
    return {
      uai: hit.uai,
      fullName: hit.fullName,
      type: hit.type,
      departmentName: hit.departmentName,
      region: hit.region,
      country: hit.country,
      city: hit.city,
      postcode: hit.postcode,
      adresse: hit.adresse,
      codeCity: hit.codeCity,
      department: hit.department,
      codePays: hit.codePays,
    };
  });
}

function serializeYoungs(body) {
  // ! Ces données ne devraient pas être dans ES : l'exclusion se fait aussi côté
  // requête (_source.excludes) et côté réplication Monstache.
  return serializeHits(body, omit(ES_YOUNG_SENSITIVE_FIELDS));
}

function serializeStructures(body) {
  return serializeHits(body, (hit) => hit);
}

function serializeReferents(body) {
  return serializeHits(body, omit([...ES_REFERENT_SENSITIVE_FIELDS, "__v"]));
}

function serializeApplications(body) {
  return serializeHits(body, (hit) => hit);
}

module.exports = {
  serializeMissions,
  serializeSchools,
  serializeRamsesSchools,
  serializeYoungs,
  serializeStructures,
  serializeReferents,
  serializeApplications,
  serializeHits,
};
