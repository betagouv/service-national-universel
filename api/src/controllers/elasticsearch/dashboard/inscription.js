const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../../sentry");
const esClient = require("../../../es");
const { ERRORS } = require("../../../utils");
const { joiElasticSearch } = require("../utils");
const { ROLES, ES_NO_LIMIT, YOUNG_STATUS_PHASE1 } = require("snu-lib");

