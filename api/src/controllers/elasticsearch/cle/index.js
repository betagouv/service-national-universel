const express = require("express");
const router = express.Router();

router.use("/classe", require("./classe"));
router.use("/young", require("./young"));
router.use("/etablissement", require("./etablissement"));

module.exports = router;
