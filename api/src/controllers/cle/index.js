const express = require("express");
const router = express.Router();

router.use("/referent", require("./referent"));
router.use("/referent-signup", require("./referent-signup"));
router.use("/young", require("./young"));

module.exports = router;
