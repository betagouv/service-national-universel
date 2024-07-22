const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { JVA_MISSION_DOMAINS } = require("snu-lib");

router.post("/search/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const schema = Joi.object({
      filters: Joi.object({
        search: Joi.string().allow(""),
        domain: Joi.string().allow(...Object.keys(JVA_MISSION_DOMAINS), ""),
        distance: Joi.number().integer().min(0).max(100),
        location: Joi.object({
          lat: Joi.number().min(-90).max(90),
          lon: Joi.number().min(-180).max(180),
        }),
        publisherName: Joi.string().allow(""),
      }),
      page: Joi.number()
        .integer()
        .default(0)
        .custom((value, helpers) => {
          if (value < 0) {
            return 0;
          }
          return value;
        }),
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
          must: [{ range: { endAt: { gt: "now" } } }, { range: { places: { gt: 0 } } }],
        },
      },
      from: page * 20,
      size,
      sort: [],
    };

    if (sort === "geo") body.sort.push({ _geo_distance: { location: filters.location, order: "asc", unit: "km", mode: "min" } });
    if (sort === "recent") body.sort.push({ createdAt: { order: "desc" } });

    if (filters.search) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: filters.search,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "cross_fields",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filters.search,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "phrase",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filters.search,
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

    if (filters.domain) body.query.bool.must.push({ term: { "domain.keyword": filters.domain } });
    if (filters.distance) body.query.bool.must.push({ geo_distance: { distance: `${filters.distance}km`, location: filters.location } });
    if (filters.publisherName) body.query.bool.must.push({ term: { "publisherName.keyword": filters.publisherName } });

    const results = await esClient.search({ index: "missionapi", body });
    if (results.body.error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    return res.status(200).send({ ok: true, data: results.body.hits });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
