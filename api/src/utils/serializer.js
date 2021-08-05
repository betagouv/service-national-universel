const { isYoung } = require(".");

function serializeApplication(application) {
  return application.toObject({
    transform: (_doc, ret) => {
      delete ret.sqlId;
      return ret;
    },
  });
}

function serializeBus(bus, user) {
  return bus.toObject();
}

function serializeMission(mission, user) {
  return mission.toObject({
    transform: (_doc, ret) => {
      delete ret.sqlId;
      delete ret.sqlStructureId;
      delete ret.sqlTutorId;
      return ret;
    },
  });
}

function serializeCohesionCenter(center, user) {
  return center.toObject({
    transform: (_doc, ret) => {
      if (isYoung(user)) {
        delete ret.waitingList;
      }
      return ret;
    },
  });
}

function serializeYoung(young, user) {
  return young.toObject({
    transform: (_doc, ret) => {
      delete ret.sqlId;
      delete ret.password;
      delete ret.forgotPasswordResetToken;
      delete ret.forgotPasswordResetExpires;
      delete ret.invitationToken;
      delete ret.invitationExpires;
      delete ret.phase3Token;
      delete ret.__v;
      if (isYoung(user)) {
        delete ret.historic;
        delete ret.qpv;
      }
      return ret;
    },
  });
}

function serializeReferent(referent, user) {
  return referent.toObject({
    transform: (_doc, ret) => {
      delete ret.sqlId;
      delete ret.password;
      delete ret.forgotPasswordResetToken;
      delete ret.forgotPasswordResetExpires;
      delete ret.invitationToken;
      delete ret.invitationExpires;
      return ret;
    },
  });
}

function serializeStructure(structure, user) {
  return structure.toObject({
    transform: (_doc, ret) => {
      if (isYoung(user)) {
        return subObject(ret, ["facebook", "instagram", "website", "twitter", "description"]);
      }
      delete ret.sqlId;
      delete ret.sqlUserId;
      delete ret.sqlNetworkId;
      return ret;
    },
  });
}
function serializeDepartmentService(departmentService, user) {
  return departmentService.toObject();
}

function serializeArrayStructures(structures, user) {
  return structures.map((s) => serializeStructure(s, user));
}
function serializeArray(arr, user, serialize) {
  return arr.map((s) => serialize(s, user));
}

// return only the initialValue's properties that are in the whitelist 'keys'
const subObject = (initialValue, keys) =>
  keys.reduce((o, k) => {
    o[k] = initialValue[k];
    return o;
  }, {});

module.exports = {
  serializeApplication,
  serializeBus,
  serializeCohesionCenter,
  serializeYoung,
  serializeReferent,
  serializeMission,
  serializeStructure,
  serializeArrayStructures,
  serializeArray,
  serializeDepartmentService,
};
