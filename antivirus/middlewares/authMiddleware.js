// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const { JWT_SECRET, SECRET_API_KEY } = require("../config");
const { capture } = require("../sentry");

module.exports = (req, res, next) => {
  const accessToken = req.header("x-access-token");
  if (!accessToken) return res.status(403).send({ ok: false, code: "ACCESS_DENIED" });

  try {
    const { apiKey } = jwt.verify(accessToken, JWT_SECRET);
    if (!apiKey || apiKey !== SECRET_API_KEY) {
      throw new Error("INVALID_TOKEN");
    }

    next();
  } catch (error) {
    capture(error);
    return res.status(401).send({ ok: false, code: "INVALID_TOKEN" });
  }
};
