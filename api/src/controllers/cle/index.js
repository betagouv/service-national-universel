const express = require("express");
const router = express.Router();

router.use("/classe", require("./classe"));
router.use("/etablissement", require("./etablissement"));
router.use("/referent", require("./referent"));

module.exports = router;
