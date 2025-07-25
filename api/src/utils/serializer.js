const { isYoung } = require(".");

function serializeApplication(application) {
  return application.toObject();
}

function serializeBus(bus) {
  return bus.toObject();
}

function serializeMission(mission) {
  return mission.toObject({
    transform: (_doc, ret) => {
      delete ret.jvaRawData;
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

function serializeSessionPhase1(session, user) {
  const raw = typeof session.toObject === "function" ? session.toObject() : session;

  if (isYoung(user)) {
    delete raw.waitingList;
  }

  return raw;
}

function serializeYoung(young, user) {
  return young.toObject({
    transform: (_doc, ret) => {
      delete ret.password;
      delete ret.passwordChangedAt;
      delete ret.token2FA;
      delete ret.token2FAExpires;
      delete ret.attempts2FA;
      delete ret.tokenEmailValidation;
      delete ret.tokenEmailValidationExpires;
      delete ret.attemptsEmailValidation;
      delete ret.lastLogoutAt;
      delete ret.nextLoginAttemptIn;
      delete ret.forgotPasswordResetToken;
      delete ret.forgotPasswordResetExpires;
      delete ret.invitationToken;
      delete ret.invitationExpires;
      delete ret.phase3Token;
      delete ret.loginAttempts;
      delete ret.__v;
      if (isYoung(user)) {
        delete ret.qpv;
      }
      return ret;
    },
  });
}

function serializeReferent(referent) {
  return referent.toObject({
    transform: (_doc, ret) => {
      delete ret.password;
      delete ret.passwordChangedAt;
      delete ret.token2FA;
      delete ret.token2FAExpires;
      delete ret.attempts2FA;
      delete ret.lastLogoutAt;
      delete ret.nextLoginAttemptIn;
      delete ret.forgotPasswordResetToken;
      delete ret.forgotPasswordResetExpires;
      delete ret.invitationToken;
      delete ret.invitationExpires;
      delete ret.loginAttempts;
      delete ret.__v;
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
      delete ret.jvaRawData;
      return ret;
    },
  });
}
function serializeDepartmentService(departmentService) {
  return departmentService.toObject();
}

function serializeMeetingPoint(meetingPoint) {
  return meetingPoint.toObject();
}

function serializeEmail(email) {
  return email.toObject();
}

function serializeContract(contract, user, withTokens = true) {
  if (!withTokens || isYoung(user)) {
    return contract.toObject({
      transform: (_doc, ret) => {
        delete ret.parent1Token;
        delete ret.projectManagerToken;
        delete ret.structureManagerToken;
        delete ret.parent2Token;
        delete ret.youngContractToken;
        return ret;
      },
    });
  }
  return contract.toObject();
}

function serializeArray(arr, user, serialize) {
  return arr.map((s) => serialize(s, user));
}

function serializeAlerteMessage(message) {
  return message.toObject();
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
  serializeSessionPhase1,
  serializeYoung,
  serializeReferent,
  serializeMission,
  serializeStructure,
  serializeArray,
  serializeDepartmentService,
  serializeMeetingPoint,
  serializeEmail,
  serializeContract,
  serializeAlerteMessage,
};
