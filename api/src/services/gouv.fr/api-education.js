const queryString = require("querystring");
const { capture } = require("../../sentry");

const apiEducation = async ({ filters, page, size }, path, options = {}) => {
  try {
    const type = filters.find((filter) => filter.key === "type")?.value ?? [];
    size = size ?? 20;

    let where = "";
    (filters || []).forEach((filter) => {
      if (filter.key === "uai") where += `identifiant_de_l_etablissement = "${filter.value}"`;
      if (filter.key === "name") where += `${where.length ? " AND " : ""}nom_etablissement LIKE "${filter.value}"`;
      if (filter.key === "city") where += `${where.length ? " AND " : ""}nom_commune LIKE "${filter.value}"`;
    });

    const res = await fetch(
      "https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records?" +
        queryString.stringify({
          where,
          limit: size,
          offset: page * size,
        }) +
        (!type.length || type.includes("LYC") ? `&refine=${encodeURIComponent(`type_etablissement:"Lycée"`)}` : "") +
        (!type.length || type.includes("COL") ? `&refine=${encodeURIComponent(`type_etablissement:"Collège"`)}` : "") +
        (!type.length || type.includes("EREA") ? `&refine=${encodeURIComponent(`type_etablissement:"EREA"`)}` : ""),
      {
        ...options,
        retries: 3,
        retryDelay: 1000,
        retryOn: [502, 503, 504],
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        mode: "cors",
        method: "GET",
      },
    );
    return await res.json();
  } catch (e) {
    capture(e, { extra: { path: path } });
  }
};

module.exports = { apiEducation };
