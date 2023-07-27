const express = require("express");
const router = express.Router();

router.use("/cohesioncenter", require("./cohesioncenter"));
router.use("/young", require("./young"));
router.use("/sessionphase1", require("./sessionphase1"));
router.use("/plandetransport", require("./plandetransport"));
router.use("/modificationbus", require("./modificationbus"));
router.use("/structure", require("./structure"));
router.use("/pointderassemblement", require("./pointderassemblement"));
router.use("/lignebus", require("./lignebus"));
router.use("/schoolramses", require("./schoolramses"));
router.use("/mission", require("./mission"));
router.use("/email", require("./email"));
router.use("/application", require("./application"));
router.use("/referent", require("./referent"));
router.use("/dashboard", require("./dashboard"));
router.use("/association", require("./association"));
router.use("/keynumbers", require("./keynumbers"));

module.exports = router;
