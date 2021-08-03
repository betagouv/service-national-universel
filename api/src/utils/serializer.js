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

function serializeCohesionCenter(center, user) {
  return center.toObject();
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

module.exports = {
  serializeApplication,
  serializeBus,
  serializeCohesionCenter,
};
