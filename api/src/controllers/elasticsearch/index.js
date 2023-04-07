const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody } = require("./utils");

router.use("/cohesioncenter", require("./cohesioncenter"));
router.use("/young", require("./young"));
router.use("/sessionphase1", require("./sessionphase1"));
router.use("/plandetransport", require("./plandetransport"));

module.exports = router;
