const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { ES_NO_LIMIT, ROLES, APPLICATION_STATUS, canSeeDashboardEngagementInfo, canSeeDashboardEngagementStatus } = require("snu-lib");
const { joiElasticSearch, buildMissionContext, buildApplicationContext, buildDashboardUserRoleContext } = require("../utils");
// TODO: Guard all requests according to roles

router.post("/status-divers", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canSeeDashboardEngagementInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["status", "cohorts", "academy", "department", "region"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { dashboardUserRoleContextFilters } = buildDashboardUserRoleContext(req.user);

    const body = {
      query: {
        bool: {
          must: [
            { match_all: {} },
            queryFilters?.status?.length ? { terms: { "status.keyword": queryFilters.status } } : null,
            queryFilters?.cohorts?.length ? { terms: { "cohort.keyword": queryFilters.cohorts } } : null,
            queryFilters?.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
            queryFilters?.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
            queryFilters?.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
          ].filter(Boolean),
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
      aggs: {
        phase2ApplicationStatus: {
          terms: {
            field: "phase2ApplicationStatus.keyword",
            size: ES_NO_LIMIT,
          },
        },
        statusPhase2Contract: {
          terms: {
            field: "statusPhase2Contract.keyword",
            size: ES_NO_LIMIT,
          },
        },
      },
      size: 0,
    };

    const reponse = await esClient.search({ index: "young", body: body });
    if (!reponse?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    //format data
    const phase2ApplicationStatus = reponse?.body?.aggregations?.phase2ApplicationStatus?.buckets;
    const totalPhase2 = phase2ApplicationStatus?.reduce((acc, current) => acc + current.doc_count, 0);
    const statusPhase2Contract = reponse?.body?.aggregations?.statusPhase2Contract?.buckets;
    const totalContract = statusPhase2Contract?.reduce((acc, current) => acc + current.doc_count, 0);

    const data = [];
    for (const current of phase2ApplicationStatus) {
      data.push({ category: "phase2", status: current.key, value: current.doc_count, percentage: totalPhase2 ? current.doc_count / totalPhase2 : 0 });
    }
    for (const current of statusPhase2Contract) {
      data.push({ category: "contract", status: current.key, value: current.doc_count, percentage: totalContract ? current.doc_count / totalContract : 0 });
    }

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/structures", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canSeeDashboardEngagementInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["region", "departement"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { dashboardUserRoleContextFilters } = buildDashboardUserRoleContext(req.user);

    const body = {
      query: {
        bool: {
          must: [
            { match_all: {} },
            queryFilters.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
            queryFilters.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
          ].filter(Boolean),
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
      aggs: {
        total_with_network_name: {
          filter: {
            bool: {
              must_not: [{ term: { "networkId.keyword": "" } }, { bool: { must_not: { exists: { field: "networkId" } } } }],
            },
          },
        },
        by_legal_status: {
          terms: {
            field: "legalStatus.keyword",
            missing: "N/A",
          },
          aggs: {
            by_type: {
              terms: {
                field: "types.keyword",
              },
            },
          },
        },
      },
      size: 0,
      track_total_hits: true,
    };
    const responseInscription = await esClient.search({ index: "structure", body: body });
    if (!responseInscription?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    return res.status(200).send(responseInscription.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/status-de-phases", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canSeeDashboardEngagementInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["status", "cohorts", "academy", "department", "region"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { dashboardUserRoleContextFilters } = buildDashboardUserRoleContext(req.user);

    const body = {
      query: {
        bool: {
          must: [
            { match_all: {} },
            queryFilters?.status?.length ? { terms: { "status.keyword": queryFilters.status } } : null,
            queryFilters?.cohorts?.length ? { terms: { "cohort.keyword": queryFilters.cohorts } } : null,
            queryFilters?.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
            queryFilters?.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
            queryFilters?.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
          ].filter(Boolean),
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
      aggs: {
        phase1: {
          terms: {
            field: "statusPhase1.keyword",
            size: ES_NO_LIMIT,
          },
        },
        phase2: {
          terms: {
            field: "statusPhase2.keyword",
            size: ES_NO_LIMIT,
          },
        },
        phase3: {
          terms: {
            field: "statusPhase3.keyword",
            size: ES_NO_LIMIT,
          },
        },
      },
      size: 0,
    };

    const reponse = await esClient.search({ index: "young", body: body });
    if (!reponse?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    //format data
    const data = [
      { phase: 1, result: reponse?.body?.aggregations?.phase1?.buckets },
      { phase: 2, result: reponse?.body?.aggregations?.phase2?.buckets },
      { phase: 3, result: reponse?.body?.aggregations?.phase3?.buckets },
    ];

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/mission-proposed-places", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canSeeDashboardEngagementInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["region", "department", "start", "end", "source"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { dashboardUserRoleContextFilters } = buildDashboardUserRoleContext(req.user);

    let filters = [
      queryFilters.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
      queryFilters.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
      req.body.missionFilters.start?.length ? { range: { startAt: { gte: req.body.missionFilters.start } } } : null,
      req.body.missionFilters.end?.length ? { range: { endAt: { lte: req.body.missionFilters.end } } } : null,
    ];

    const sources = req.body.missionFilters.sources || [];
    if (sources.length === 1 && sources.includes("JVA")) {
      filters.push({ term: { "isJvaMission.keyword": "true" } });
    }
    if (sources.length === 1 && sources.includes("SNU")) {
      filters.push({ term: { "isJvaMission.keyword": "false" } });
    }

    const body = {
      query: {
        bool: {
          must: [{ term: { "status.keyword": "VALIDATED" } }, ...filters.filter(Boolean)],
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
      aggs: {
        places_total: {
          sum: {
            field: "placesTotal",
          },
        },
        places_left: {
          sum: {
            field: "placesLeft",
          },
        },
      },
      size: 0,
    };

    const responseMissions = await esClient.search({ index: "mission", body: body });
    if (!responseMissions?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const data = {
      left: responseMissions?.body?.aggregations?.places_left?.value,
      occupied: responseMissions?.body?.aggregations?.places_total?.value - responseMissions?.body?.aggregations?.places_left?.value,
      total: responseMissions?.body?.aggregations?.places_total?.value,
    };

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/mission-status", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canSeeDashboardEngagementInfo(req.user) && !canSeeDashboardEngagementStatus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let missionContextFilters = [];
    if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(req.user.role)) {
      const { missionContextFilters: mCtxFilters, missionContextError } = await buildMissionContext(req.user);
      if (missionContextError) return res.status(missionContextError.status).send(missionContextError.body);
      missionContextFilters = mCtxFilters;
    }

    const filterFields = ["department", "region", "structureId"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { dashboardUserRoleContextFilters } = buildDashboardUserRoleContext(req.user);

    let filters = [
      queryFilters.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
      queryFilters.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
      req.body.missionFilters.start?.length ? { range: { startAt: { gte: req.body.missionFilters.start } } } : null,
      req.body.missionFilters.end?.length ? { range: { endAt: { lte: req.body.missionFilters.end } } } : null,
    ];

    const sources = req.body.missionFilters.sources || [];
    if (sources.length === 1 && sources.includes("JVA")) {
      filters.push({ term: { "isJvaMission.keyword": "true" } });
    }
    if (sources.length === 1 && sources.includes("SNU")) {
      filters.push({ term: { "isJvaMission.keyword": "false" } });
    }

    const body = {
      query: {
        bool: {
          must: [{ match_all: {} }, ...filters.filter(Boolean)],
          filter: [...dashboardUserRoleContextFilters, ...missionContextFilters].filter(Boolean),
        },
      },
      aggs: {
        by_status: {
          terms: {
            field: "status.keyword",
            size: ES_NO_LIMIT,
          },
          aggs: {
            total: {
              sum: {
                field: "placesTotal",
              },
            },
            left: {
              sum: {
                field: "placesLeft",
              },
            },
          },
        },
      },
      size: 0,
    };

    const response = await esClient.search({ index: "mission", body: body });

    if (!response?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const buckets = response.body.aggregations.by_status.buckets;

    const data = buckets.map((bucket) => ({
      status: bucket.key,
      value: bucket.doc_count,
      percentage: bucket.doc_count / buckets.reduce((acc, bucket) => acc + bucket.doc_count, 0),
      total: bucket.total.value,
      left: bucket.left.value,
    }));

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/application-status", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // TODO: refacto this part with middleware
    const user = req.user;
    const allowedRoles = [ROLES.SUPERVISOR, ROLES.RESPONSIBLE];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    const filterFields = ["department", "region", "structureId"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    let filters = [
      queryFilters.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
      queryFilters.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
    ];

    const body = {
      query: {
        bool: {
          must: [{ match_all: {} }, ...filters.filter(Boolean)],
          filter: [...applicationContextFilters].filter(Boolean),
        },
      },
      aggs: {
        by_status: {
          terms: {
            field: "status.keyword",
            size: ES_NO_LIMIT,
          },
        },
        by_contract_status: {
          filter: {
            bool: {
              must: [],
              filter: [{ terms: { "status.keyword": [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE] } }],
            },
          },
          aggs: { names: { terms: { field: "contractStatus.keyword", size: ES_NO_LIMIT } } },
        },
      },
      size: 0,
    };

    const response = await esClient.search({ index: "application", body: body });

    if (!response?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const bucketsApplication = response.body.aggregations.by_status.buckets;
    const bucketsContract = response.body.aggregations.by_contract_status.names.buckets;

    const data = {
      APPLICATION: bucketsApplication.reduce((acc, bucket) => {
        const key = bucket.key;
        acc[key] = {
          nb: bucket.doc_count,
          percentage: Math.round((bucket.doc_count / bucketsContract.reduce((acc, bucke) => acc + bucke.doc_count, 0)) * 100),
        };
        return acc;
      }, {}),
      CONTRACT: bucketsContract.reduce((acc, bucket) => {
        const key = bucket.key;
        acc[key] = {
          nb: bucket.doc_count,
          percentage: Math.round((bucket.doc_count / bucketsContract.reduce((acc, bucke) => acc + bucke.doc_count, 0)) * 100),
        };
        return acc;
      }, {}),
    };

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
