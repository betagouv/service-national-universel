const { allRecords } = require("../../../es/utils");

async function populateYoungExport(data, exportFields) {
  //School
  if (exportFields.includes("schoolId")) {
    const schoolIds = [...new Set(data.map((item) => item.schoolId).filter(Boolean))];
    const schools = await allRecords("schoolramses", { bool: { must: { ids: { values: schoolIds } } } });
    data = data.map((item) => ({ ...item, school: schools?.find((e) => e._id.toString() === item.schoolId) }));
  }

  //center
  if (exportFields.includes("cohesionCenterId")) {
    const centerIds = [...new Set(data.map((item) => item.cohesionCenterId).filter(Boolean))];
    const centers = await allRecords("cohesioncenter", { bool: { must: { ids: { values: centerIds } } } });
    data = data.map((item) => ({ ...item, center: centers?.find((e) => e._id.toString() === item.cohesionCenterId) }));
  }

  //full info bus
  if (exportFields.includes("ligneId")) {
    //get bus
    const busIds = [...new Set(data.map((item) => item.ligneId).filter(Boolean))];
    const bus = await allRecords("lignebus", { bool: { must: { ids: { values: busIds } } } });
    data = data.map((item) => ({ ...item, bus: bus?.find((e) => e._id.toString() === item.ligneId) }));
    //get ligneToPoint
    const meetingPointsIds = [...new Set(bus.reduce((prev, item) => [...prev, ...item.meetingPointsIds], []))];
    const lignesToPoint = await allRecords("lignetopoint", { bool: { must: { terms: { "meetingPointId.keyword": meetingPointsIds } } } });
    data = data.map((item) => ({ ...item, ligneToPoint: lignesToPoint?.find((e) => e.meetingPointId === item.meetingPointId && e.lineId === item.ligneId) }));
    //get meetingPoint
    const meetingPoints = await allRecords("pointderassemblement", { bool: { must: { ids: { values: meetingPointsIds } } } });
    data = data.map((item) => ({ ...item, meetingPoint: meetingPoints?.find((e) => e._id.toString() === item.meetingPointId) }));
  }

  if (exportFields.includes("classeId")) {
    const classeIds = [...new Set(data.map((item) => item.classeId).filter(Boolean))];
    const classes = await allRecords("classe", { bool: { must: { ids: { values: classeIds } } } });
    data = data.map((item) => ({ ...item, classe: classes?.find((e) => e._id.toString() === item.classeId) }));
  }

  if (exportFields.includes("etablissementId")) {
    const etablissementIds = [...new Set(data.map((item) => item.etablissementId).filter(Boolean))];
    const etablissements = await allRecords("etablissement", { bool: { must: { ids: { values: etablissementIds } } } });
    data = data.map((item) => ({ ...item, etablissement: etablissements?.find((e) => e._id.toString() === item.etablissementId) }));
  }

  return data;
}

const populateYoungWithClasse = async (young) => {
  const classeIds = [...new Set(young.map((item) => item._source.classeId).filter((e) => e))];
  if (classeIds.length > 0) {
    // --- fill classe
    const classes = await allRecords("classe", { ids: { values: classeIds } });
    young = young.map((item) => ({
      ...item,
      _source: { ...item._source, classe: classes.find((e) => e._id === item._source.classeId) },
    }));
  }
  return young;
};

module.exports = {
  populateYoungExport,
  populateYoungWithClasse,
};
