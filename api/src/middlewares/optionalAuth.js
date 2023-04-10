const jwt = require("jsonwebtoken");
const config = require("../config");
const ReferentObject = require("../models/referent");
const YoungObject = require("../models/young");
const { getToken } = require("../passport");

const optionalAuth = async (req, _, next) => {
  try {
    const token = getToken(req);
    let user;
    if (token) {
      const jwtPayload = await new Promise((resolve, reject) => {
        jwt.verify(token, config.secret, function (err, decoded) {
          if (err) reject(err);
          resolve(decoded);
        });
      });
      if (!jwtPayload._id) {
        return;
      }
      user = await ReferentObject.findById(jwtPayload._id);
      if (!user) {
        user = await YoungObject.findById(jwtPayload._id);
      }
      if (user && jwtPayload.lastLogoutAt === user.lastLogoutAt && jwtPayload.password === user.password) {
        req.user = user;
      }
    }
  } catch (e) {}
  next();
};

module.exports = optionalAuth;
