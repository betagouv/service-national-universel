const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, YOUNG_STATUS, STATUS_CLASSE, FeatureFlagName, canSearchInElasticSearch, SUB_ROLES, YOUNG_STATUS_PHASE1 } = require("snu-lib");

const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { allRecords } = require("../../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("../utils");
const { EtablissementModel, CohortModel } = require("../../../models");
const { serializeReferents } = require("../../../utils/es-serializer");
const { isFeatureAvailable } = require("../../../featureFlag/featureFlagService");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["cohort.keyword", "name.keyword", "uniqueKeyAndId.keyword"];
    const filterFields = [
      "cohort.keyword",
      "coloration.keyword",
      "grades.keyword",
      "name.keyword",
      "sector.keyword",
      "status.keyword",
      "statusPhase1.keyword",
      "type.keyword",
      "uniqueKeyAndId.keyword",
      "etablissementId.keyword",
      "department.keyword",
      "region.keyword",
      "academy.keyword",
      "schoolYear.keyword",
      "seatsTaken",
    ];

    const sortFields = ["createdAt", "name.keyword", "seatsTaken"];

    // Authorization
    if (!canSearchInElasticSearch(user, "classe")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { classeContextFilters, classeContextError } = await buildClasseContext(user);
    if (classeContextError) {
      return res.status(classeContextError.status).send(classeContextError.body);
    }

    // Context filters
    const contextFilters = [...classeContextFilters, { bool: { must_not: { exists: { field: "deletedAt" } } } }];

    // Body params validation
    const { queryFilters, page, sort, exportFields, error, size } = joiElasticSearch({ filterFields, sortFields, body: body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
    });

    if (req.params.action === "export") {
      let response = await allRecords("classe", hitsRequestBody.query, esClient, exportFields);
      response = await populateWithEtablissementInfo(response);
      response = await populateWithYoungsInfo(response);
      response = await populateWithAllReferentsInfo(response);

      if (req.query?.type === "schema-de-repartition") {
        if (![ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(user.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

        if (user.role === ROLES.TRANSPORTER) {
          const cohort = [...new Set(response.map((item) => item.cohort).filter(Boolean))];
          if (cohort.length !== 1) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
          const IsSchemaDownloadIsTrue = await CohortModel.findOne({ name: cohort });
          if (!IsSchemaDownloadIsTrue) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
          if (IsSchemaDownloadIsTrue.repartitionSchemaDownloadAvailibility === false && user.role === ROLES.TRANSPORTER) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
          }
        }

        response = await populateWithCohesionCenterInfo(response);
        response = await populateWithPdrInfo(response);
        response = await populateWithLigneInfo(response);
      }

      return res.status(200).send({ ok: true, data: response });
    } else {
      let response = await esClient.msearch({ index: "classe", body: buildNdJson({ index: "classe", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      if (req.query?.needRefInfo) {
        response.body.responses[0].hits.hits = await populateWithReferentClasseInfo(response.body.responses[0].hits.hits);
      }

      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

async function buildClasseContext(user) {
  const contextFilters = [];
  if (await isFeatureAvailable(FeatureFlagName.CLE_BEFORE_JULY_15)) {
    if (user.role !== ROLES.ADMIN) {
      contextFilters.push({ term: { "schoolYear.keyword": "2023-2024" } });
    }
  }

  if (user.role === ROLES.ADMINISTRATEUR_CLE) {
    const etablissement = await EtablissementModel.findOne({ $or: [{ coordinateurIds: user._id }, { referentEtablissementIds: user._id }] });
    if (!etablissement) return { classeContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ term: { "etablissementId.keyword": etablissement._id.toString() } });
  }

  if (user.role === ROLES.REFERENT_CLASSE) {
    contextFilters.push({ term: { "referentClasseIds.keyword": user._id.toString() } });
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    const etablissements = await EtablissementModel.find({ department: user.department });
    contextFilters.push({ terms: { "etablissementId.keyword": etablissements.map((e) => e._id.toString()) } });
  }
  if (user.role === ROLES.REFERENT_REGION) {
    const etablissements = await EtablissementModel.find({ region: user.region });
    contextFilters.push({ terms: { "etablissementId.keyword": etablissements.map((e) => e._id.toString()) } });
  }

  if (user.role === ROLES.TRANSPORTER) {
    contextFilters.push({ bool: { must_not: { term: { "status.keyword": STATUS_CLASSE.WITHDRAWN } } } });
  }

  return { classeContextFilters: contextFilters };
}

const populateWithReferentClasseInfo = async (classes) => {
  const refIds = [...new Set(classes.map((item) => item._source.referentClasseIds).filter(Boolean))];

  const referents = await allRecords("referent", { ids: { values: refIds.flat() } }, esClient, ["_id", "firstName", "lastName", "email", "phone", "invitationToken"]);

  const referentsData = serializeReferents(referents);

  return classes.map((item) => {
    item._source.referents = referentsData?.filter((e) => item._source.referentClasseIds.includes(e._id.toString()));

    return item;
  });
};
const populateWithLigneInfo = async (classes) => {
  const ligneIds = [...new Set(classes.map((item) => item.ligneId).filter(Boolean))];
  const ligneBus = await allRecords("lignebus", { ids: { values: ligneIds.flat() } });
  return classes.map((item) => {
    item.ligne = ligneBus.find((e) => item.ligneId === e._id.toString());

    return item;
  });
};

const populateWithEtablissementInfo = async (classes) => {
  const etablissementIds = [...new Set(classes.map((item) => item.etablissementId).filter(Boolean))];
  const etablissements = await allRecords("etablissement", { ids: { values: etablissementIds.flat() } });
  return classes.map((item) => {
    item.etablissement = etablissements?.filter((e) => item.etablissementId === e._id.toString()).shift();
    return item;
  });
};

const populateWithCohesionCenterInfo = async (classes) => {
  const cohesionCenterIds = [...new Set(classes.map((item) => item.cohesionCenterId).filter(Boolean))];
  const cohesionCenter = await allRecords("cohesioncenter", { ids: { values: cohesionCenterIds.flat() } });
  return classes.map((item) => {
    item.cohesionCenter = cohesionCenter?.filter((e) => item.cohesionCenterId === e._id.toString()).shift();
    return item;
  });
};

const populateWithPdrInfo = async (classes) => {
  const pdrIds = [...new Set(classes.map((item) => item.pointDeRassemblementId).filter(Boolean))];
  const pdrs = await allRecords("pointderassemblement", { ids: { values: pdrIds.flat() } });
  return classes.map((item) => {
    item.pointDeRassemblement = pdrs?.filter((e) => item.pointDeRassemblementId === e._id.toString()).shift();
    return item;
  });
};

const populateWithYoungsInfo = async (classes) => {
  const classesIds = classes.map((item) => item._id);
  const students = await allRecords("young", { bool: { must: [{ terms: { classeId: classesIds } }] } }, esClient, ["_id", "classeId", "status", "statusPhase1"]);

  //count students by class
  const result = students.reduce((acc, cur) => {
    if (!acc[cur.classeId]) {
      acc[cur.classeId] = [];
    }
    acc[cur.classeId].push(cur);
    return acc;
  }, {});

  //populate classes with students count
  return classes.map((item) => {
    item.studentInProgress = result[item._id]?.filter((student) => student.status === YOUNG_STATUS.IN_PROGRESS).length || 0;
    item.studentWaitingValidation = result[item._id]?.filter((student) => student.status === YOUNG_STATUS.WAITING_VALIDATION).length || 0;
    item.studentWaitingCorrection = result[item._id]?.filter((student) => student.status === YOUNG_STATUS.WAITING_CORRECTION).length || 0;
    item.studentValidated = result[item._id]?.filter((student) => student.status === YOUNG_STATUS.VALIDATED).length || 0;
    item.studentAbandoned = result[item._id]?.filter((student) => student.status === YOUNG_STATUS.ABANDONED).length || 0;
    item.studentNotAutorized = result[item._id]?.filter((student) => student.status === YOUNG_STATUS.NOT_AUTORISED).length || 0;
    item.studentWithdrawn = result[item._id]?.filter((student) => student.status === YOUNG_STATUS.WITHDRAWN).length || 0;
    item.studentAffected = result[item._id]?.filter((student) => student.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED).length || 0;
    item.openFiles = item.studentValidated + item.studentInProgress + item.studentWaitingValidation + item.studentWaitingCorrection;
    return item;
  });
};

const populateWithAllReferentsInfo = async (classes) => {
  const referentEtablissementIds = [...new Set(classes.map((item) => item.etablissement?.referentEtablissementIds).filter(Boolean))];

  const referentClasseIds = [...new Set(classes.map((item) => item.referentClasseIds).filter(Boolean))];

  const coordinateurIds = [...new Set(classes.map((item) => item.etablissement?.coordinateurIds).filter(Boolean))];

  const allReferentIds = [...new Set([...referentEtablissementIds, ...referentClasseIds, ...coordinateurIds].flat())];

  const referents = await allRecords("referent", { ids: { values: allReferentIds } }, esClient, ["_id", "firstName", "lastName", "email", "phone", "invitationToken"]);

  const extendedReferents = referents.map((referent) => ({
    ...referent,
    state: referent.invitationToken === null || referent.invitationToken === "" || referent?.invitationToken === undefined ? "Actif" : "Inactif",
  }));

  const referentsData = serializeReferents(extendedReferents);

  return classes.map((item) => {
    const referentEtablissementFiltered = referentsData?.filter((e) => item.etablissement?.referentEtablissementIds?.includes(e._id.toString()));

    const referentClasseFiltered = referentsData?.filter((e) => item.referentClasseIds?.includes(e._id.toString()));

    const coordinateursFiltered = referentsData?.filter((e) => item.etablissement?.coordinateurIds?.includes(e._id.toString()));

    item.referentEtablissement = referentEtablissementFiltered;
    item.referents = referentClasseFiltered;
    item.coordinateurs = coordinateursFiltered;

    return item;
  });
};

module.exports = router;
