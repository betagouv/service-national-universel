const { ZAMMAD_IP } = require("../config");
const { ERRORS } = require("../utils");

const admin = (req, res, next) => {
  if (req.headers["x-forwarded-for"] !== ZAMMAD_IP) {
    res.status(403).send({ ok: false, code: ERRORS.INVALID_IP, message: "Invalid IP" });
    return;
  }
  next();
};

module.exports = admin;
