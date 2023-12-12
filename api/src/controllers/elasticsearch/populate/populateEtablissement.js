const esClient = require("../../../es");

//maybe refacto this
const populateEtablissementWithNumber = async ({ etablissements, index }) => {
  const etablissementIds = [...new Set(etablissements.map((item) => item._id.toString()).filter((e) => e))];
  if (etablissementIds.length > 0) {
    let body = {
      query: {
        bool: {
          must: [{ terms: { "etablissementId.keyword": etablissementIds } }],
        },
      },
      aggs: {
        group_by_etablissement: {
          terms: { field: "etablissementId.keyword" },
        },
      },
      size: 0,
    };

    const results = await esClient.search({ index, body });
    const buckets = results.body.aggregations.group_by_etablissement.buckets;

    for (const etablissement of etablissements) {
      const bucket = buckets.find((b) => b.key === etablissement._id.toString());
      etablissement._source[`nb_${index}`] = bucket ? bucket.doc_count : 0;
    }
  }
  return etablissements;
};

module.exports = {
  populateEtablissementWithNumber,
};
