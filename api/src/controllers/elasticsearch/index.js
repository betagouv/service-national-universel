const express = require("express");
const router = express.Router();

router.use("/cohesioncenter", require("./cohesioncenter"));
router.use("/young", require("./young"));
router.use("/sessionphase1", require("./sessionphase1"));
router.use("/plandetransport", require("./plandetransport"));
router.use("/modificationbus", require("./modificationbus"));
router.use("/pointderassemblement", require("./pointderassemblement"));
router.use("/lignebus", require("./lignebus"));
router.use("/mission", require("./mission"));

module.exports = router;
