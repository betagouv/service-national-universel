const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const StructureObject = require("../models/structure");
const MissionObject = require("../models/mission");
const ReferentObject = require("../models/referent");
const { ERRORS } = require("../utils");
const { ROLES, canModifyStructure, canDeleteStructure } = require("snu-lib/roles");
const patches = require("./patches");
const { validateId, validateStructure } = require("../utils/validator");
const { serializeStructure, serializeArray, serializeMission } = require("../utils/serializer");

// router.get();

module.exports = router;
