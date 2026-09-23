const { getYoungFieldsHiddenFrom, omitYoungFields } = require("snu-lib");
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
      // Anciens jetons du parcours des représentants légaux (décommissionné) : secrets, jamais exposés.
      delete ret.parent1Inscription2023Token;
      delete ret.parent2Inscription2023Token;
      delete ret.loginAttempts;
      delete ret.__v;
      if (isYoung(user)) {
        delete ret.qpv;
      }
      // Notes internes, santé et pièces d'identité selon le rôle : l'interface les masquait
      // déjà, l'API les renvoyait quand même (audit des fronts 2026-09-23, FH6/FH10).
      return omitYoungFields(ret, getYoungFieldsHiddenFrom(user));
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

// Les jetons de signature ne sortent jamais de l'API : ils ne circulent que dans les emails
// envoyés à chaque signataire. Un référent qui les lisait pouvait signer à la place des parents
// ou de l'État.
function serializeContract(contract) {
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
