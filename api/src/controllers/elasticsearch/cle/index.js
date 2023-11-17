const express = require("express");
const router = express.Router();

router.use("/classe", require("./classe"));

module.exports = router;
