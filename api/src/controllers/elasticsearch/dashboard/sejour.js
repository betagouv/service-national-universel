const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { buildArbitratyNdJson } = require("../utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("../utils");
const { sessions2023, ROLES, ES_NO_LIMIT, YOUNG_STATUS_PHASE1 } = require("snu-lib");
const CohortModel = require("../../../models/cohort");
const ApplicationModel = require("../../../models/application");
const Joi = require("joi");

router.post("/moderator", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  // creation de la Query avec filtres pour récupèrer les infos des jeunes
  const buildESRequestBodyForYoung = () => {
    const filterFields = ["statusPhase1", "region", "department", "cohorts", "academy", "status"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const aggsFilter = {};
    if (queryFilters?.statusPhase1?.length) {
      aggsFilter.filter = {
        bool: {
          must: [],
          filter: [{ terms: { "statusPhase1.keyword": queryFilters?.statusPhase1?.filter((s) => s !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) } }],
        },
      };
    }
    const bodyYoung = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        statusPhase1: { terms: { field: "statusPhase1.keyword" } },
        pdr: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "hasMeetingInformation.keyword", missing: "NR", size: ES_NO_LIMIT } } },
        },
        participation: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "youngPhase1Agreement.keyword", size: ES_NO_LIMIT } } },
        },
        precense: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "cohesionStayPresence.keyword", missing: "NR", size: ES_NO_LIMIT } } },
        },
        JDM: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "presenceJDM.keyword", missing: "NR", size: ES_NO_LIMIT } } },
        },
        depart: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "departInform.keyword", size: ES_NO_LIMIT } } },
        },
        departMotif: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "departSejourMotif.keyword", size: ES_NO_LIMIT } } },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    if (queryFilters.region?.length) bodyYoung.query.bool.filter.push({ terms: { "region.keyword": queryFilters.region } });
    if (queryFilters.department?.length) bodyYoung.query.bool.filter.push({ terms: { "department.keyword": queryFilters.department } });
    if (queryFilters.cohorts?.length) bodyYoung.query.bool.filter.push({ terms: { "cohort.keyword": queryFilters.cohorts } });
    if (queryFilters.academy?.length) bodyYoung.query.bool.filter.push({ terms: { "academy.keyword": queryFilters.academy } });
    if (queryFilters.status?.length) bodyYoung.query.bool.filter.push({ terms: { "status.keyword": queryFilters.status } });

    return bodyYoung;
  };
  // création de la query pour récupèrer les infos des centres
  const buildESRequestBodyForCohesion = (filters) => {
    const bodyCohesion = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        typology: { terms: { field: "typology.keyword", size: ES_NO_LIMIT } },
        domains: { terms: { field: "domain.keyword", size: ES_NO_LIMIT } },
        capacity: { sum: { field: "placesTotal" } },
      },
      size: ES_NO_LIMIT,
    };

    if (filters.region?.length) bodyCohesion.query.bool.filter.push({ terms: { "region.keyword": filters.region } });
    if (filters.department?.length) bodyCohesion.query.bool.filter.push({ terms: { "department.keyword": filters.department } });
    if (filters.academy?.length) bodyCohesion.query.bool.filter.push({ terms: { "academy.keyword": filters.academy } });
    if (filters.cohorts?.length) bodyCohesion.query.bool.filter.push({ terms: { "cohorts.keyword": filters.cohorts } });

    return bodyCohesion;
  };
  // Création de la Query pour récupérer les info de la Session
  const buildESRequestBodyForSession = (cohesionCenterId, filters) => {
    const bodySession = {
      query: { bool: { must: { match_all: {} }, filter: [{ terms: { cohesionCenterId } }] } },
      aggs: {
        placesTotal: { sum: { field: "placesTotal" } },
        placesLeft: { sum: { field: "placesLeft" } },
        status: { terms: { field: "status.keyword" } },
        timeSchedule: { terms: { field: "hasTimeSchedule.keyword" } },
      },
      size: ES_NO_LIMIT,
    };
    if (filters.cohorts?.length) bodySession.query.bool.filter.push({ terms: { "cohort.keyword": filters.cohorts } });

    return bodySession;
  };
  // Creation de la Query pour récupérer les informations pour l'affichages des centres
  const buildESRequestBodyForSessionCenter = (filters, sessionList) => {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        session: {
          terms: { field: "sessionPhase1Id.keyword", size: ES_NO_LIMIT },
          aggs: {
            presence: { terms: { field: "cohesionStayPresence.keyword" } },
            presenceJDM: { terms: { field: "presenceJDM.keyword" } },
          },
        },
      },
      size: 0,
    };

    if (filters.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filters.status } });
    if (filters.statusPhase1?.length) body.query.bool.filter.push({ terms: { "statusPhase1.keyword": filters.statusPhase1 } });
    let sessionPhase1Id = sessionList.map((session) => session._id).filter((id) => id);
    if (sessionPhase1Id.length) body.query.bool.filter.push({ terms: { "sessionPhase1Id.keyword": sessionPhase1Id } });

    return body;
  };
  // à partir de la query pour afficher les Centres on va créer notre objet à retourner au Front.
  const processESResponse = (response, sessionList) => {
    const sessionAggreg = response.body.aggregations.session.buckets.reduce((acc, session) => {
      acc[session.key] = {
        total: session.doc_count,
        presence: session.presence.buckets.reduce((acc, presence) => {
          acc[presence.key] = presence.doc_count;
          return acc;
        }, {}),
        presenceJDM: session.presenceJDM.buckets.reduce((acc, presenceJDM) => {
          acc[presenceJDM.key] = presenceJDM.doc_count;
          return acc;
        }, {}),
      };
      return acc;
    }, {});

    const sessionByCenter = sessionList.reduce((acc, session) => {
      if (!acc[session.cohesionCenterId]) {
        acc[session.cohesionCenterId] = {
          centerId: session.cohesionCenterId,
          centerName: session.nameCentre,
          centerCity: session.cityCentre,
          department: session.department,
          region: session.region,
          total: sessionAggreg[session._id]?.total || 0,
          presence: sessionAggreg[session._id]?.presence?.false || 0,
          presenceJDM: sessionAggreg[session._id]?.presenceJDM?.false || 0,
        };
      } else {
        acc[session.cohesionCenterId].total += sessionAggreg[session._id]?.total || 0;
        acc[session.cohesionCenterId].presence += sessionAggreg[session._id]?.presence?.false || 0;
        acc[session.cohesionCenterId].presenceJDM += sessionAggreg[session._id]?.presenceJDM?.false || 0;
      }
      return acc;
    }, {});

    return Object.values(sessionByCenter);
  };
  // Dans cette fonction on utilise notre Query sur les Young et on constitue notre objet pour le Front.
  const getYoungForSejourDasboard = async () => {
    const youngRequestBodyForCohesiongYoung = buildESRequestBodyForYoung();
    const responseYoung = await esClient.search({ index: "young", body: youngRequestBodyForCohesiongYoung });
    const YoungCenter = responseYoung.body;
    let resultYoung = {};
    resultYoung.statusPhase1 = YoungCenter.aggregations.statusPhase1.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.statusPhase1Total = YoungCenter.hits.total.value;
    resultYoung.pdrTotal = YoungCenter.aggregations.pdr.doc_count;
    resultYoung.participation = YoungCenter.aggregations.participation.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.participationTotal = YoungCenter.aggregations.participation.doc_count;
    resultYoung.presence = YoungCenter.aggregations.precense.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.JDM = YoungCenter.aggregations.JDM.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.depart = YoungCenter.aggregations.depart.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.departTotal = YoungCenter.aggregations.depart.doc_count;
    resultYoung.departMotif = YoungCenter.aggregations.departMotif.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});

    return resultYoung;
  };
  // Dans cette fonction on utilise nos Deux Query (Session Cohesion) afin de créer notre objet pour le Front.
  const getCenterAndSessionInfoForSejourDashboard = async (filters) => {
    const esRequestBodyForCohesion = buildESRequestBodyForCohesion(filters);
    const responseCohesion = await esClient.search({ index: "cohesioncenter", body: esRequestBodyForCohesion });
    if (!responseCohesion?.body?.aggregations) return res.status(404).send({ error: ERRORS.NOT_FOUND, message: "1" });
    let resultCenter = {};
    resultCenter.typology = responseCohesion.body.aggregations.typology.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultCenter.domains = responseCohesion.body.aggregations.domains.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultCenter.capacity = responseCohesion.body.aggregations.capacity.value;
    resultCenter.totalCenter = responseCohesion.body.hits.total.value;

    const cohesionCenterId = responseCohesion.body.hits.hits.map((e) => e._id);
    const esRequestForSession = buildESRequestBodyForSession(cohesionCenterId, filters);
    const responseSession = await esClient.search({ index: "sessionphase1", body: esRequestForSession });
    if (!responseSession?.body?.aggregations) return res.status(404).send({ error: ERRORS.NOT_FOUND, message: "2" });
    resultCenter.placesTotalSession = responseSession.body.aggregations.placesTotal.value;
    resultCenter.placesLeftSession = responseSession.body.aggregations.placesLeft.value;
    resultCenter.status = responseSession.body.aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {});
    resultCenter.timeSchedule = responseSession.body.aggregations.timeSchedule.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {});
    resultCenter.totalSession = responseSession.body.hits.total.value;

    return { resultCenter, responseSession };
  };
  // Dans cette fonction on utilise notre Query Session Center afin de créer notre objet pour afficher les centres sur le Front.
  const getCenterInfoFromYoungForSejourDashboard = async (responseSession, filters) => {
    const sessionList = responseSession.body.hits.hits.map((e) => ({ ...e._source, _id: e._id }));
    const esRequestBody = buildESRequestBodyForSessionCenter(filters, sessionList);
    const response = await esClient.search({ index: "young", body: esRequestBody });
    if (!response?.body?.aggregations?.session) return res.status(404).send({ error: ERRORS.NOT_FOUND, message: "3" });
    const sessionByCenter = processESResponse(response, sessionList);

    return sessionByCenter;
  };

  try {
    const { filters } = req.body;
    const resultYoung = await getYoungForSejourDasboard();
    const { resultCenter, responseSession } = await getCenterAndSessionInfoForSejourDashboard(filters);
    const sessionByCenter = await getCenterInfoFromYoungForSejourDashboard(responseSession, filters);

    return res.status(200).send({ resultCenter, sessionByCenter, resultYoung });
  } catch (error) {
    console.error("Erreur dans /sessionAndCenter:", error);
    res.status(500).send({ error: ERRORS.SERVER_ERROR, details: error.message });
  }
});

module.exports = router;
