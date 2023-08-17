const express = require("express");
const router = express.Router();

router.use("/general", require("./general"));
router.use("/sejour", require("./sejour"));
router.use("/inscription", require("./inscription"));

module.exports = router;