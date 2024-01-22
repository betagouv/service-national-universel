const express = require("express");
const router = express.Router();

router.use("/api-education", require("./api-education"));

module.exports = router;
