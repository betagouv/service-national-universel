const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { joiElasticSearch, buildDashboardUserRoleContext } = require("../utils");
const { ROLES, ES_NO_LIMIT, YOUNG_STATUS_PHASE1, YOUNG_STATUS, canSeeDashboardSejourInfo, canSeeDashboardSejourHeadCenter } = require("snu-lib");
const { SessionPhase1Model } = require("../../../models");

router.post("/moderator", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  // creation de la Query avec filtres pour récupèrer les infos des jeunes
  const { dashboardUserRoleContextFilters } = buildDashboardUserRoleContext(req.user);

  const buildESRequestBodyForYoung = (queryFilters) => {
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
      query: {
        bool: {
          must: [
            { match_all: {} },
            // context filter
            queryFilters.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
            queryFilters.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
            queryFilters.cohort?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
            queryFilters.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
            queryFilters.status?.length ? { terms: { "status.keyword": queryFilters.status } } : null,
          ].filter(Boolean),
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
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

    return bodyYoung;
  };
  // création de la query pour récupèrer les infos des centres
  const buildESRequestBodyForCohesion = (filters) => {
    const bodyCohesion = {
      query: {
        bool: {
          must: [
            { match_all: {} },
            // context filter
            filters.region?.length ? { terms: { "region.keyword": filters.region } } : null,
            filters.department?.length ? { terms: { "department.keyword": filters.department } } : null,
            filters.academy?.length ? { terms: { "academy.keyword": filters.academy } } : null,
            filters.cohort?.length ? { terms: { "cohorts.keyword": filters.cohort } } : null,
          ].filter(Boolean),
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
      aggs: {
        typology: { terms: { field: "typology.keyword", size: ES_NO_LIMIT } },
        domains: { terms: { field: "domain.keyword", size: ES_NO_LIMIT } },
        capacity: { sum: { field: "placesTotal" } },
      },
      size: ES_NO_LIMIT,
    };

    return bodyCohesion;
  };
  // Création de la Query pour récupérer les info de la Session
  const buildESRequestBodyForSession = (cohesionCenterId, filters) => {
    const bodySession = {
      query: {
        bool: {
          //context filter
          must: [{ match_all: {} }, { terms: { cohesionCenterId } }, filters.cohort?.length ? { terms: { "cohort.keyword": filters.cohort } } : null].filter(Boolean),
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
      aggs: {
        placesTotal: { sum: { field: "placesTotal" } },
        placesLeft: { sum: { field: "placesLeft" } },
        status: { terms: { field: "status.keyword" } },
        timeSchedule: { terms: { field: "hasTimeSchedule.keyword" } },
      },
      size: ES_NO_LIMIT,
    };

    return bodySession;
  };
  // Creation de la Query pour récupérer les informations pour l'affichages des centres
  const buildESRequestBodyForSessionCenter = (filters, sessionList) => {
    const sessionPhase1Id = sessionList.map((session) => session._id).filter((id) => id);
    const body = {
      query: {
        bool: {
          must: [
            { match_all: {} },
            // context filter
            filters.status?.length ? { terms: { "status.keyword": filters.status } } : null,
            filters.statusPhase1?.length ? { terms: { "statusPhase1.keyword": filters.statusPhase1 } } : null,
            sessionPhase1Id.length ? { terms: { "sessionPhase1Id.keyword": sessionPhase1Id } } : null,
          ].filter(Boolean),
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
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
  const getYoungForSejourDasboard = async (queryFilters) => {
    const youngRequestBodyForCohesiongYoung = buildESRequestBodyForYoung(queryFilters);
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
  const getCenterAndSessionInfoForSejourDashboard = async (filters, user) => {
    const esRequestBodyForCohesion = buildESRequestBodyForCohesion(filters, user);
    const responseCohesion = await esClient.search({ index: "cohesioncenter", body: esRequestBodyForCohesion });
    if (!responseCohesion?.body?.aggregations || !responseCohesion?.body?.hits)
      return res.status(404).send({ error: ERRORS.NOT_FOUND, message: "Error in getCenterAndSessionInfoForSejourDashboard" });
    let resultCenter = {};
    resultCenter.typology = responseCohesion.body.aggregations.typology.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultCenter.domains = responseCohesion.body.aggregations.domains.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultCenter.capacity = responseCohesion.body.aggregations.capacity.value;
    resultCenter.totalCenter = responseCohesion.body.hits.total.value;

    const cohesionCenterId = responseCohesion.body.hits.hits.map((e) => e._id);
    const esRequestForSession = buildESRequestBodyForSession(cohesionCenterId, filters);
    const responseSession = await esClient.search({ index: "sessionphase1", body: esRequestForSession });
    if (!responseSession?.body?.aggregations) return res.status(404).send({ error: ERRORS.NOT_FOUND, message: "Error in getCenterAndSessionInfoForSejourDashboard" });
    resultCenter.placesTotalSession = responseSession.body.aggregations.placesTotal.value;
    resultCenter.placesLeftSession = responseSession.body.aggregations.placesLeft.value;
    resultCenter.status = responseSession.body.aggregations.status.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {});
    resultCenter.timeSchedule = responseSession.body.aggregations.timeSchedule.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {});
    resultCenter.totalSession = responseSession.body.hits.total.value;

    return { resultCenter, responseSession };
  };
  // Dans cette fonction on utilise notre Query Session Center afin de créer notre objet pour afficher les centres sur le Front.
  const getCenterInfoFromYoungForSejourDashboard = async (responseSession, filters) => {
    if (!responseSession?.body?.hits) return res.status(404).send({ error: ERRORS.NOT_FOUND, message: "Error in getCenterInfoFromYoungForSejourDashboard" });
    const sessionList = responseSession.body.hits.hits.map((e) => ({ ...e._source, _id: e._id }));
    const esRequestBody = buildESRequestBodyForSessionCenter(filters, sessionList);
    const response = await esClient.search({ index: "young", body: esRequestBody });
    if (!response?.body?.aggregations?.session) return res.status(404).send({ error: ERRORS.NOT_FOUND, message: "Error in getCenterInfoFromYoungForSejourDashboard" });
    const sessionByCenter = processESResponse(response, sessionList);

    return sessionByCenter;
  };

  try {
    const filterFields = ["statusPhase1", "region", "department", "cohort", "academy", "status"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canSeeDashboardSejourInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const resultYoung = await getYoungForSejourDasboard(queryFilters);
    const { resultCenter, responseSession } = await getCenterAndSessionInfoForSejourDashboard(queryFilters);
    const sessionByCenter = await getCenterInfoFromYoungForSejourDashboard(responseSession, queryFilters);

    return res.status(200).send({ resultCenter, sessionByCenter, resultYoung });
  } catch (error) {
    capture(error);
    res.status(500).send({ error: ERRORS.SERVER_ERROR });
  }
});

router.post("/head-center", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  if (!canSeeDashboardSejourHeadCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  const session = await SessionPhase1Model.findOne({ headCenterId: req.user._id, cohort: req.body.filters.cohort });
  // creation de la Query avec filtres pour récupèrer les infos des jeunes
  const aggsFilter = {};
  aggsFilter.filter = {
    bool: {
      must: [],
      filter: [],
    },
  };
  const buildESRequestBodyForYoung = (queryFilters) => {
    const bodyYoung = {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            { terms: { "sessionPhase1Id.keyword": [session._id] } },
            { term: { "status.keyword": YOUNG_STATUS.VALIDATED } },
            queryFilters.cohort?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
            queryFilters.status?.length ? { terms: { "status.keyword": queryFilters.status } } : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        statusPhase1: { terms: { field: "statusPhase1.keyword" } },
        sanitary: {
          ...aggsFilter,
          aggs: { names: { terms: { field: "cohesionStayMedicalFileReceived.keyword", size: ES_NO_LIMIT } } },
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

    return bodyYoung;
  };

  // Dans cette fonction on utilise notre Query sur les Young et on constitue notre objet pour le Front.
  const getYoungForSejourDasboard = async (queryFilters, centersId) => {
    const youngRequestBodyForCohesiongYoung = buildESRequestBodyForYoung(queryFilters, centersId);
    const responseYoung = await esClient.search({ index: "young", body: youngRequestBodyForCohesiongYoung });
    const YoungCenter = responseYoung.body;
    let resultYoung = {};
    resultYoung.statusPhase1 = YoungCenter.aggregations.statusPhase1.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.statusPhase1Total = YoungCenter.hits.total.value;
    resultYoung.sanitary = YoungCenter.aggregations.sanitary.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.sanitaryTotal = YoungCenter.aggregations.sanitary.doc_count;
    resultYoung.participation = YoungCenter.aggregations.participation.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.participationTotal = YoungCenter.aggregations.participation.doc_count;
    resultYoung.presence = YoungCenter.aggregations.precense.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.JDM = YoungCenter.aggregations.JDM.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.depart = YoungCenter.aggregations.depart.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});
    resultYoung.departTotal = YoungCenter.aggregations.depart.doc_count;
    resultYoung.departMotif = YoungCenter.aggregations.departMotif.names.buckets.reduce((acc, e) => ({ ...acc, [e.key]: e.doc_count }), {});

    return resultYoung;
  };

  try {
    const filterFields = ["cohort", "status", "cohesionCenterId"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const allowedRoles = [ROLES.HEAD_CENTER];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const resultYoung = await getYoungForSejourDasboard(queryFilters);

    return res.status(200).send({ resultYoung });
  } catch (error) {
    capture(error);
    res.status(500).send({ error: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
