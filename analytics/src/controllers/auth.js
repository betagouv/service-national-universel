const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { capture } = require("../sentry");

const { SECRET_API_KEY, JWT_SECRET } = require("../config");

router.get("/token", async (req, res) => {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey || apiKey !== SECRET_API_KEY) return res.status(418).send({ ok: false, code: "ACCESS_DENIED" });
    const token = jwt.sign({ apiKey }, JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).send({ ok: true, token });
  } catch (error) {
    console.log("Error ", error);
    capture(error);
  }
});

module.exports = router;
