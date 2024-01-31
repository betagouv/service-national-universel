const { allRecords } = require("../../../es/utils");
const { serializeReferents } = require("../../../utils/es-serializer");
const esClient = require("../../../es");

const populateWithReferentInfo = async ({ etablissements, isExport }) => {
  const refIds = [...new Set(etablissements.map((item) => (isExport ? item.referentEtablissementIds : item._source.referentEtablissementIds)).filter(Boolean))];
  const referents = await allRecords("referent", { ids: { values: refIds.flat() } });
  const referentsData = serializeReferents(referents);
  return etablissements.map((item) => {
    if (isExport) item.referentEtablissement = referentsData?.filter((e) => item.referentEtablissementIds.includes(e._id.toString()));
    else item._source.referentEtablissement = referentsData?.filter((e) => item._source.referentEtablissementIds.includes(e._id.toString()));
    return item;
  });
};

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
      const key = `nb_${index}`;
      const value = bucket ? bucket.doc_count : 0;
      etablissement._source ? (etablissement._source[key] = value) : (etablissement[key] = value);
    }
  }
  return etablissements;
};

module.exports = {
  populateWithReferentInfo,
  populateEtablissementWithNumber,
};
