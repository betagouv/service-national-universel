const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const { SECRET_API_KEY, JWT_SECRET } = require("../config");

router.get("/token", async (req, res) => {
  const apiKey = req.header("x-api-key");
  if (!apiKey || apiKey !== SECRET_API_KEY) return res.status(403).send({ ok: false, code: "ACCESS_DENIED" });
  const token = jwt.sign({ apiKey }, JWT_SECRET, {
    expiresIn: "1d",
  });
  return res.status(200).send({ ok: true, token });
});

module.exports = router;
