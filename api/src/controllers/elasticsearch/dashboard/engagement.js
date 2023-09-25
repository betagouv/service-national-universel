const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { joiElasticSearch } = require("../utils");
const { ES_NO_LIMIT, COHORTS } = require("snu-lib");

router.post("/status-divers", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const filterFields = ["status", "cohorts", "academy", "department", "region"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const body = {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            queryFilters?.status?.length ? { terms: { "status.keyword": queryFilters.status } } : null,
            queryFilters?.cohorts?.length ? { terms: { "cohort.keyword": queryFilters.cohorts } } : null,
            queryFilters?.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
            queryFilters?.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
            queryFilters?.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
          ].filter(Boolean),
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
    const filterFields = ["region", "departement"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const body = {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            queryFilters.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
            queryFilters.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        total_with_network_name: {
          filter: {
            bool: {
              must_not: [{ term: { "networkName.keyword": "" } }, { bool: { must_not: { exists: { field: "networkName" } } } }],
            },
          },
        },
        by_legal_status: {
          terms: {
            field: "legalStatus.keyword",
            missing: "EMPTY",
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
    const filterFields = ["status", "cohorts", "academy", "department", "region"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const body = {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [
            queryFilters?.status?.length ? { terms: { "status.keyword": queryFilters.status } } : null,
            queryFilters?.cohorts?.length ? { terms: { "cohort.keyword": queryFilters.cohorts } } : null,
            queryFilters?.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
            queryFilters?.department?.length ? { terms: { "department.keyword": queryFilters.department } } : null,
            queryFilters?.region?.length ? { terms: { "region.keyword": queryFilters.region } } : null,
          ].filter(Boolean),
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

router.post("/mission-status", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const filterFields = ["department", "region"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

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
          must: { match_all: {} },
          filter: filters.filter(Boolean),
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

module.exports = router;
