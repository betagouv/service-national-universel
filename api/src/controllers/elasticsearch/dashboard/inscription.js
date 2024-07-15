const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { joiElasticSearch, buildDashboardUserRoleContext } = require("../utils");
const { ES_NO_LIMIT, getCohortNames, ROLES, region2department, YOUNG_STATUS, canSeeDashboardInscriptionInfo, canSeeDashboardInscriptionDetail } = require("snu-lib");
const { SessionPhase1Model } = require("../../../models");

router.post("/inscriptionGoal", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user } = req;

    if (!canSeeDashboardInscriptionInfo(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const { dashboardUserRoleContextFilters } = buildDashboardUserRoleContext(req.user);

    const body = {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [...dashboardUserRoleContextFilters].filter(Boolean),
        },
      },
      size: ES_NO_LIMIT,
    };
    const responseInscription = await esClient.search({ index: "inscriptiongoal", body: body });
    if (!responseInscription?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    return res.status(200).send(responseInscription.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/youngBySchool", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user } = req;

    if (!canSeeDashboardInscriptionInfo(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["status", "cohort", "academy", "department"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const body = {
      query: {
        bool: {
          must: [
            { match_all: {} },
            //context filter
            queryFilters.region?.length ? { terms: { "schoolRegion.keyword": queryFilters.region } } : null,
            queryFilters.department?.length ? { terms: { "schoolDepartment.keyword": queryFilters.department } } : null,
            queryFilters.cohort?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
            queryFilters.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
          ].filter(Boolean),
          filter: [
            //query
            user.role === ROLES.REFERENT_REGION || user.role === ROLES.VISITOR ? { terms: { "schoolRegion.keyword": [user.region] } } : null,
            user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "schoolDepartment.keyword": user.department } } : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        school: {
          terms: { field: "schoolId.keyword", size: 500 },
          aggs: { departments: { terms: { field: "department.keyword" } }, firstUser: { top_hits: { size: 1 } } },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    const result = await esClient.search({ index: "young", body: body });
    const response = result.body;
    return res.status(200).send(response);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/youngsReport", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user } = req;
    const { filters, department } = req.body;

    if (!canSeeDashboardInscriptionInfo(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (user.role === ROLES.REFERENT_REGION && !region2department[user.region].includes(department))
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (user.role === ROLES.REFERENT_DEPARTMENT && !user.department.includes(department)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const body = {
      query: {
        bool: {
          must: [{ match_all: {} }],
          filter: [{ terms: { "cohort.keyword": filters?.cohort } }, { term: { "department.keyword": department } }],
        },
      },
      aggs: { status: { terms: { field: "status.keyword" } } },
      size: 0,
    };

    const responses = await esClient.search({ index: "young", body: body });
    if (responses.body && responses.body.hits && responses.body.hits.hits) {
      return res.status(200).json(responses.body);
    } else {
      return res.status(404).send("No matching data found in Elasticsearch");
    }
  } catch (error) {
    capture(error);
    return res.status(500).send("Error fetching data from Elasticsearch");
  }
});

router.post("/inscriptionInfo", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user } = req;

    if (!canSeeDashboardInscriptionDetail(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["status", "cohort", "academy", "department"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    let session = null;
    if (req.user.role === ROLES.HEAD_CENTER) {
      session = await SessionPhase1Model.findOne({ headCenterId: req.user._id, cohort: queryFilters.cohort });
    }

    const body = {
      query: {
        bool: {
          must: [
            { match_all: {} },
            //context fitler
            session ? { terms: { "sessionPhase1Id.keyword": [session._id] } } : null,
            session ? { term: { "status.keyword": YOUNG_STATUS.VALIDATED } } : null,
            queryFilters?.cohort?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
            queryFilters?.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
            queryFilters?.status?.length ? { terms: { "status.keyword": queryFilters.status } } : null,
          ].filter(Boolean),
          filter: [
            user.role === ROLES.REFERENT_REGION || user.role === ROLES.VISITOR
              ? {
                  bool: {
                    should: [
                      { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": [user.region] } }] } },
                      { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": [user.region] } }] } },
                    ],
                  },
                }
              : null,
            user.role === ROLES.REFERENT_DEPARTMENT
              ? {
                  bool: {
                    should: [
                      { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolDepartment.keyword": user.department } }] } },
                      { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "department.keyword": user.department } }] } },
                    ],
                  },
                }
              : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        age: {
          terms: {
            field: "birthdateAt",
            size: ES_NO_LIMIT,
          },
        },
        gender: {
          terms: {
            field: "gender.keyword",
            size: ES_NO_LIMIT,
          },
        },
        grade: {
          terms: {
            field: "grade.keyword",
            size: ES_NO_LIMIT,
          },
        },
        situation: {
          terms: {
            field: "situation.keyword",
            size: ES_NO_LIMIT,
          },
        },
        qpv: {
          terms: {
            field: "qpv.keyword",
            size: ES_NO_LIMIT,
          },
        },
        rural: {
          terms: {
            field: "isRegionRural.keyword",
            size: ES_NO_LIMIT,
          },
        },
        handicap: {
          terms: {
            field: "handicap.keyword",
            size: ES_NO_LIMIT,
          },
        },
        allergies: {
          terms: {
            field: "allergies.keyword",
            size: ES_NO_LIMIT,
          },
        },
        handicapInSameDepartment: {
          terms: {
            field: "handicapInSameDepartment.keyword",
            size: ES_NO_LIMIT,
          },
        },
        reducedMobilityAccess: {
          terms: {
            field: "reducedMobilityAccess.keyword",
            size: ES_NO_LIMIT,
          },
        },
        ppsBeneficiary: {
          terms: {
            field: "ppsBeneficiary.keyword",
            size: ES_NO_LIMIT,
          },
        },
        paiBeneficiary: {
          terms: {
            field: "paiBeneficiary.keyword",
            size: ES_NO_LIMIT,
          },
        },
        specificAmenagment: {
          terms: {
            field: "specificAmenagment.keyword",
            size: ES_NO_LIMIT,
          },
        },
      },
      size: 0,
    };
    if (queryFilters?.region?.length)
      body.query.bool.must.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": queryFilters.region } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": queryFilters.region } }] } },
          ],
        },
      });
    if (queryFilters?.department?.length)
      body.query.bool.must.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolDepartment.keyword": queryFilters.department } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "department.keyword": queryFilters.department } }] } },
          ],
        },
      });

    const result = await esClient.search({ index: "young", body: body });
    const response = result.body;
    return res.status(200).send(response);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/getInAndOutCohort", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user } = req;

    if (!canSeeDashboardInscriptionInfo(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["status", "cohort", "academy", "department"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const cohortList = queryFilters?.cohort?.length ? queryFilters.cohort : getCohortNames();

    const aggs = cohortList.reduce((acc, cohort) => {
      acc["in&" + cohort] = {
        filter: {
          bool: {
            must: [{ term: { "cohort.keyword": cohort } }, { term: { "status.keyword": "VALIDATED" } }, { exists: { field: "originalCohort.keyword" } }],
            must_not: [{ term: { "originalCohort.keyword": cohort } }],
            filter: [],
          },
        },
      };
      acc["out&" + cohort] = {
        filter: {
          bool: {
            must: [{ term: { "originalCohort.keyword": cohort } }, { term: { "status.keyword": "VALIDATED" } }, { exists: { field: "originalCohort.keyword" } }],
            must_not: [{ term: { "cohort.keyword": cohort } }],
            filter: [],
          },
        },
      };
      return acc;
    }, {});

    const body = {
      query: {
        bool: {
          must: [{ match_all: {} }],
          filter: [
            user.role === ROLES.REFERENT_REGION
              ? {
                  bool: {
                    should: [
                      { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": [user.region] } }] } },
                      { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": [user.region] } }] } },
                    ],
                  },
                }
              : null,
            user.role === ROLES.REFERENT_DEPARTMENT
              ? {
                  bool: {
                    should: [
                      { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolDepartment.keyword": user.department } }] } },
                      { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "department.keyword": user.department } }] } },
                    ],
                  },
                }
              : null,
          ].filter(Boolean),
        },
      },
      aggs,
      size: 0,
    };

    if (queryFilters?.academy?.length) body.query.bool.must.push({ terms: { "academy.keyword": queryFilters.academy } });
    if (queryFilters?.region?.length)
      body.query.bool.must.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": queryFilters.region } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": queryFilters.region } }] } },
          ],
        },
      });

    if (queryFilters?.department?.length)
      body.query.bool.must.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolDepartment.keyword": queryFilters.department } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "department.keyword": queryFilters.department } }] } },
          ],
        },
      });

    const result = await esClient.search({ index: "young", body: body });
    const response = result.body;
    return res.status(200).send(response);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/youngForInscription", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user } = req;

    if (!canSeeDashboardInscriptionInfo(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["statusPhase1", "statusPhase2", "statusPhase3", "status", "cohort", "academy", "department", "region"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const body = {
      query: {
        bool: {
          must: [
            { match_all: {} },

            queryFilters?.cohort?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
            queryFilters?.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
          ].filter(Boolean),
          filter: [
            user.role === ROLES.REFERENT_REGION || user.role === ROLES.VISITOR
              ? {
                  bool: {
                    should: [
                      { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": [user.region] } }] } },
                      { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": [user.region] } }] } },
                    ],
                  },
                }
              : null,
            user.role === ROLES.REFERENT_DEPARTMENT
              ? {
                  bool: {
                    should: [
                      { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolDepartment.keyword": user.department } }] } },
                      { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "department.keyword": user.department } }] } },
                    ],
                  },
                }
              : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        status: {
          terms: {
            field: "status.keyword",
            size: ES_NO_LIMIT,
          },
          aggs: {
            statusPhase1: {
              terms: {
                field: "statusPhase1.keyword",
                size: ES_NO_LIMIT,
              },
            },
            statusPhase2: {
              terms: {
                field: "statusPhase2.keyword",
                size: ES_NO_LIMIT,
              },
            },
            statusPhase3: {
              terms: {
                field: "statusPhase3.keyword",
                size: ES_NO_LIMIT,
              },
            },
          },
        },
      },
      size: 0,
    };

    if (queryFilters?.region?.length)
      body.query.bool.must.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": queryFilters.region } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": queryFilters.region } }] } },
          ],
        },
      });

    if (queryFilters?.department?.length)
      body.query.bool.must.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolDepartment.keyword": queryFilters.department } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "department.keyword": queryFilters.department } }] } },
          ],
        },
      });

    const responseYoung = await esClient.search({ index: "young", body: body });
    if (!responseYoung?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const youngCenter = responseYoung.body;
    return res.status(200).send(youngCenter);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/totalYoungByDate", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user } = req;

    if (!canSeeDashboardInscriptionInfo(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filterFields = ["cohort", "academy", "department", "region"];
    const { queryFilters, error } = joiElasticSearch({ filterFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const body = {
      query: {
        bool: {
          must: [
            { match_all: {} },
            queryFilters?.cohort?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
            queryFilters?.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
          ].filter(Boolean),

          filter: [
            user.role === ROLES.REFERENT_REGION || user.role === ROLES.VISITOR
              ? {
                  bool: {
                    should: [
                      { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": [user.region] } }] } },
                      { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": [user.region] } }] } },
                    ],
                  },
                }
              : null,
            user.role === ROLES.REFERENT_DEPARTMENT
              ? {
                  bool: {
                    should: [
                      { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolDepartment.keyword": user.department } }] } },
                      { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "department.keyword": user.department } }] } },
                    ],
                  },
                }
              : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        aggs: {
          date_histogram: {
            field: "createdAt",
            calendar_interval: "1M",
            format: "dd/MM/YYYY",
          },
        },
      },
      size: 0,
    };
    if (queryFilters?.region?.length)
      body.query.bool.must.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": queryFilters.region } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": queryFilters.region } }] } },
          ],
        },
      });

    if (queryFilters?.department?.length)
      body.query.bool.must.push({
        bool: {
          should: [
            { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolDepartment.keyword": queryFilters.department } }] } },
            { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "department.keyword": queryFilters.department } }] } },
          ],
        },
      });

    const responseYoung = await esClient.search({ index: "young", body: body });
    if (!responseYoung?.body) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const youngCenter = responseYoung.body;
    return res.status(200).send(youngCenter);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
