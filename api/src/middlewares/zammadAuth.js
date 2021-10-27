const { ZAMMAD_IP } = require("../config");
const { ERRORS } = require("../utils");

const admin = (req, res, next) => {
  if (req.headers['x-forwarded-for'] !== ZAMMAD_IP) {
    res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    return;
  }
  next();
};

module.exports = admin;
