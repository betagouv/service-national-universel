function serializeHits(body, callback) {
  return {
    ...body,
    responses: body.responses.map((response) => ({
      ...response,
      hits: {
        ...response.hits,
        hits: response.hits.hits.map((hit) => ({
          ...hit,
          _source: callback(hit._source),
        })),
      },
    })),
  };
}

function serializeMissions(body) {
  return serializeHits(body, (hit) => {
    delete hit.sqlId;
    delete hit.sqlStructureId;
    delete hit.sqlTutorId;
    return hit;
  });
}

function serializeSchools(body) {
  return serializeHits(body, (hit) => {
    return {
      type: hit.type,
      department: hit.department,
      city: hit.city,
      postcode: hit.postcode,
      name2: hit.name2,
      type: hit.type,
    };
  });
}

module.exports = {
  serializeMissions,
  serializeSchools,
};
