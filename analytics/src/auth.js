const { SECRET_API_KEY } = require("./config");

module.exports = (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey || apiKey !== SECRET_API_KEY) return res.status(403).send({ ok: false, code: "ACCESS_DENIED" });
  next();
};
