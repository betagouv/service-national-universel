const express = require("express");
const router = express.Router();

const LogModel = require("../models/log");

router.get("/", async (req, res) => {
  const { query } = req.body;
  const logs = await LogModel.findAll();
  return res.status(200).send({ ok: false, data: logs });
});

module.exports = router;
