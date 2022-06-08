const express = require("express");
const router = express.Router();

const LogModel = require("../models/log");

const esClient = require("../es");

router.post("/", async (req, res) => {
  const { query } = req.body;
  return res.send(result.body);
});

module.exports = router;
