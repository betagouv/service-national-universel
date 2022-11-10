function serializeHits(body, callback) {
  // In case body is already an array of records.
  if (Array.isArray(body) && body[0]?._id) {
    return body.map(callback);
  }
  return {
    ...body,
    responses:
      body.responses?.map((response) => ({
        ...response,
        hits: {
          ...response.hits,
          hits:
            response.hits?.hits?.map((hit) => ({
              ...hit,
              _source: callback(hit._source),
            })) || [],
        },
      })) || [],
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
      fullName: hit.fullName,
      uai: hit.uai,
    };
  });
}

function serializeRamsesSchools(body) {
  return serializeHits(body, (hit) => {
    return {
      uai: hit.uai,
      fullName: hit.fullName,
      type: hit.type,
      departmentName: hit.departmentName,
      region: hit.region,
      country: hit.country,
      city: hit.city,
      postcode: hit.postcode,
      adresse: hit.adresse,
      codeCity: hit.codeCity,
      department: hit.department,
      codePays: hit.codePays,
    };
  });
}

function serializeYoungs(body) {
  return serializeHits(body, (hit) => {
    delete hit.sqlId;
    delete hit.password;
    delete hit.nextLoginAttemptIn;
    delete hit.forgotPasswordResetToken;
    delete hit.forgotPasswordResetExpires;
    delete hit.invitationToken;
    delete hit.invitationExpires;
    delete hit.phase3Token;
    delete hit.loginAttempts;
    return hit;
  });
}

function serializeStructures(body) {
  return serializeHits(body, (hit) => {
    delete hit.sqlId;
    delete hit.sqlStructureId;
    delete hit.sqlTutorId;
    return hit;
  });
}

function serializeReferents(body) {
  return serializeHits(body, (hit) => {
    delete hit.sqlId;
    delete hit.password;
    delete hit.nextLoginAttemptIn;
    delete hit.forgotPasswordResetToken;
    delete hit.forgotPasswordResetExpires;
    delete hit.invitationToken;
    delete hit.invitationExpires;
    delete hit.loginAttempts;
    delete hit.__v;
    return hit;
  });
}

function serializeApplications(body) {
  return serializeHits(body, (hit) => {
    delete hit.sqlId;
    return hit;
  });
}

module.exports = {
  serializeMissions,
  serializeSchools,
  serializeRamsesSchools,
  serializeYoungs,
  serializeStructures,
  serializeReferents,
  serializeApplications,
  serializeHits,
};
