const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS, isYoung, isReferent } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const StructureObject = require("../../models/structure");
const { serializeMissions } = require("../../utils/es-serializer");
const Joi = require("joi");

const body = {
  query: { match_all: {} },
  size: 0,
  _source: { includes: ["*"], excludes: [] },
  aggs: { "domain.keyword": { terms: { field: "domain.keyword", size: 100, order: { _count: "desc" } } } },
};

router.post("/young/search/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const schema = Joi.object({
      filters: Joi.object({
        searchbar: Joi.string().allow(""),
        domains: Joi.array().items(Joi.string().allow("")),
        distance: Joi.number().integer().min(0).max(100).required(),
        location: Joi.object({
          lat: Joi.number().min(-90).max(90),
          lon: Joi.number().min(-180).max(180),
        }).required(),
        isMilitaryPreparation: Joi.boolean(),
        period: Joi.string().allow("", "CUSTOM", "VACANCES", "SCOLAIRE"),
        subPeriod: Joi.array().items(Joi.string().allow("")),
        fromDate: Joi.date(),
        toDate: Joi.date(),
        hebergement: Joi.boolean(),
      }),
      page: Joi.number().integer().min(0).default(0),
      size: Joi.number().integer().min(0).default(20),
      sort: Joi.string().allow("geo", "recent", "short", "long").default("geo"),
    });
    const { error, value } = schema.validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { filters, page, size, sort } = value;

    let body = {
      query: {
        bool: {
          must: [
            { script: { script: "doc['pendingApplications'].value < doc['placesLeft'].value * 5" } },
            { range: { endAt: { gt: "now" } } },
            { term: { "status.keyword": "VALIDATED" } },
            { term: { "visibility.keyword": "VISIBLE" } },
            { range: { placesLeft: { gt: 0 } } },
          ],
        },
      },
      from: page * 20,
      size,
      sort: [],
    };

    if (sort === "geo") body.sort.push({ _geo_distance: { location: filters.location, order: "asc", unit: "km", mode: "min" } });
    if (sort === "recent") body.sort.push({ createdAt: { order: "desc" } });
    if (sort === "short") body.sort.push({ "duration.keyword": { order: "asc" } });
    if (sort === "long") body.sort.push({ "duration.keyword": { order: "desc" } });

    if (filters.hebergement) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              geo_distance: {
                distance: `${filters.distance}km`,
                location: filters.location,
              },
            },
            { term: { "hebergement.keyword": "true" } },
          ],
          minimum_should_match: "1",
        },
      });
    } else {
      body.query.bool.must.push({
        geo_distance: {
          distance: `${filters.distance}km`,
          location: filters.location,
        },
      });
    }

    if (filters.searchbar) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: filters.searchbar,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "cross_fields",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filters.searchbar,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "phrase",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filters.searchbar,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "phrase_prefix",
                operator: "and",
              },
            },
          ],
          minimum_should_match: "1",
        },
      });
    }

    if (filters.domains?.length) body.query.bool.must.push({ terms: { "domains.keyword": filters.domains } });
    if (filters.isMilitaryPreparation) body.query.bool.must.push({ term: { "isMilitaryPreparation.keyword": String(filters.isMilitaryPreparation) } });

    if (["DURING_SCHOOL", "DURING_HOLIDAYS"].includes(filters.period)) body.query.bool.must.push({ term: { "period.keyword": filters.period } });
    if (filters.period === "CUSTOM") {
      if (filters.fromDate) body.query.bool.must.push({ range: { startAt: { gte: filters.fromDate } } });
      if (filters.toDate) body.query.bool.must.push({ range: { endAt: { lte: filters.toDate } } });
    }
    if (filters.subPeriod?.length) body.query.bool.must.push({ terms: { "subPeriod.keyword": filters.subPeriod } });

    const results = await esClient.search({ index: "mission", body });
    if (results.body.error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    return res.status(200).send({ ok: true, data: results.body.hits });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
