const { ERRORS } = require("../utils");

module.exports = (allowedRoles) => {
  return ({ user }, res, next) => {
    if (user && allowedRoles.includes(user.role)) {
      return next();
    }

    res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  };
};
