const { JWT_SECRET, SECRET_API_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const { capture } = require("../sentry");

module.exports = (req, res, next) => {
  const accessToken = req.header("x-access-token");
  if (!accessToken) return res.status(403).send({ ok: false, code: "ACCESS_DENIED" });
  try {
    const { apiKey } = jwt.verify(accessToken, JWT_SECRET);
    if (!apiKey || apiKey !== SECRET_API_KEY) {
      return res.status(401).send("INVALID_TOKEN");
    }
  } catch (error) {
    capture(error);
    return res.status(401).send("INVALID_TOKEN");
  }
  next();
};
