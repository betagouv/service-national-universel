const express = require("express");
const router = express.Router();

router.use("/classe", require("./classe"));
router.use("/young", require("./young"));

module.exports = router;
