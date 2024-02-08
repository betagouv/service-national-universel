const express = require("express");
const router = express.Router();

router.use("/classe", require("./classe"));
router.use("/etablissement", require("./etablissement"));
router.use("/referent", require("./referent"));
router.use("/referent-signup", require("./referent-signup"));
router.use("/young", require("./young"));

module.exports = router;
