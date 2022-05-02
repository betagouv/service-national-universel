const esClient = require("../es");
const Joi = require("joi");

// Variables should be renamed to avoid confusion.
async function* scrollSearch(params, client) {
  let response = await client.search(params);

  while (true) {
    const sourceHits = response.body.hits.hits;

    if (sourceHits.length === 0) {
      break;
    }

    for (const hit of sourceHits) {
      yield hit;
    }

    if (!response.body._scroll_id) {
      break;
    }

    response = await client.scroll({
      scrollId: response.body._scroll_id,
      scroll: params.scroll,
    });
  }
}

// Can get more than 10k results.
// The es param is given to scroll function
async function allRecords(index, query, client = esClient) {
  const params = {
    index,
    scroll: "1m",
    size: 1000,
    body: { query },
  };

  const result = [];

  for await (const hit of scrollSearch(params, client)) {
    result.push({ _id: hit._id, ...hit._source });
  }
  return result;
}

// Add filter to all lines of the body.
function withFilterForMSearch(body, filter) {
  return (
    body
      .split(`\n`)
      .filter((e) => e)
      .map((item, key) => {
        // Declaration line are skipped.
        if (key % 2 === 0) return item;

        const q = JSON.parse(item);
        q.query = applyFilterOnQuery(q.query, filter);

        return JSON.stringify(q);
      })
      .join(`\n`) + `\n`
  );
}

function applyFilterOnQuery(query, filter) {
  if (!query.bool) {
    if (query.match_all) {
      query = { bool: { must: { match_all: {} } } };
    } else {
      const tq = { ...query };
      query = { bool: { must: tq } };
    }
  }

  if (query.bool.filter) query.bool.filter = [...query.bool.filter, ...filter];
  else query.bool.filter = filter;

  return query;
}

function validateEsQueryFromText(body) {
  const MAX_LINES_IN_QUERY = 50000;
  const lines = body.split(`\n`).filter((e) => e);
  if (lines.length % 2 === 1) return { error: "Invalid query: odd number of lines" };
  if (lines.length > MAX_LINES_IN_QUERY) return { error: "Invalid query: too many lines" };
  const relevantLines = lines.filter((e, i) => i % 2 === 1);
  for (const line of relevantLines) {
    let parsedLine;
    try {
      parsedLine = JSON.parse(line);
    } catch (error) {
      return { error: "Invalid query: invalid JSON" };
    }
    const { error } = validateEsQuery(parsedLine);
    if (error) return { error };
  }
  return {};
}

function validateEsQuery(line) {
  const termsSchema = Joi.object({
    terms: Joi.alternatives().try(
      Joi.object().pattern(/.*/, Joi.array().max(50).items(Joi.string())).max(50),
      Joi.object({
        field: Joi.string().required(),
        size: Joi.number().integer().min(0).max(10_000),
        order: Joi.object().pattern(/.*/, Joi.string().valid("asc", "desc")),
        missing: Joi.string(),
      }),
    ),
  });
  const boolShouldTermsSchema = Joi.object({
    bool: Joi.object({
      should: Joi.array()
        .max(50)
        .items(
          Joi.alternatives().try(
            termsSchema,
            Joi.object({
              multi_match: Joi.object({
                query: Joi.string().required(),
                fields: Joi.array().max(50).items(Joi.string()),
                type: Joi.string(),
                operator: Joi.string().valid("and", "or"),
                fuzziness: Joi.number(),
              }),
            }),
            Joi.object({
              bool: Joi.object({
                must_not: Joi.object({
                  exists: Joi.object({
                    field: Joi.string().required(),
                  }),
                }),
              }),
            }),
          ),
        ),
      minimum_should_match: Joi.string(),
    }),
  });
  const boolFilterTermsSchema = Joi.object({
    bool: Joi.object({
      filter: termsSchema,
    }),
  });
  const matchAllSchema = Joi.object({ match_all: Joi.object({}) });
  return Joi.object({
    size: Joi.number(),
    query: Joi.alternatives().try(
      matchAllSchema,
      Joi.object({
        bool: Joi.object({
          filter: Joi.array().max(50).items(termsSchema),
          must: Joi.alternatives().try(
            Joi.object({ match_all: Joi.object({}) }),
            Joi.array()
              .max(50)
              .items(
                Joi.object({
                  bool: Joi.object({
                    must: Joi.array().max(50).items(Joi.alternatives().try(matchAllSchema, boolShouldTermsSchema, boolFilterTermsSchema)),
                  }),
                }),
              ),
          ),
        }),
      }),
    ),
    _source: Joi.object({
      includes: Joi.array().items(Joi.string()).max(50),
      excludes: Joi.array().items(Joi.string()).max(50),
    }),
    from: Joi.number(),
    sort: Joi.array()
      .items(Joi.object().pattern(/.*/, Joi.alternatives().try(Joi.string(), Joi.object({ order: Joi.string().valid("asc", "desc") }))))
      .max(50),
    aggs: Joi.object().pattern(/.*/, termsSchema),
    track_total_hits: Joi.boolean(),
  }).validate(line);
}

module.exports = {
  allRecords,
  applyFilterOnQuery,
  validateEsQueryFromText,
  withFilterForMSearch,
};
