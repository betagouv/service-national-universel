const express = require("express");
const router = express.Router();

router.use("/referent", require("./referent"));

module.exports = router;
