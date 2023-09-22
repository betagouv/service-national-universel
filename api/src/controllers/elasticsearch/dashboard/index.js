const express = require("express");
const router = express.Router();

router.use("/general", require("./general"));
router.use("/sejour", require("./sejour"));
router.use("/inscription", require("./inscription"));
router.use("/engagement", require("./engagement"));

module.exports = router;
