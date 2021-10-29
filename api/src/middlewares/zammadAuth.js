const { ZAMMAD_IP } = require("../config");
const { ERRORS } = require("../utils");

const admin = (req, res, next) => {
  console.log("|---- IP ADDRESS ----|", req.headers['x-forwarded-for'], typeof req.headers['x-forwarded-for']);
  console.log("|---- ZAMMAD IP ADDRESS ----|", ZAMMAD_IP, typeof ZAMMAD_IP);
  if (req.headers['x-forwarded-for'] != ZAMMAD_IP) {
    res.status(401).send({ ok: false, code: ERRORS.INVALID_IP, message: "Invalid IP" });
    return;
  }
  next();
};

module.exports = admin;
