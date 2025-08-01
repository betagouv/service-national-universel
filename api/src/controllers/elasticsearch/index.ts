import express from "express";

const router = express.Router();

router.use("/cohesioncenter", require("./cohesioncenter"));
router.use("/young", require("./young").default);
router.use("/sessionphase1", require("./sessionphase1"));
router.use("/plandetransport", require("./plandetransport"));
router.use("/modificationbus", require("./modificationbus"));
router.use("/structure", require("./structure").default);
router.use("/pointderassemblement", require("./pointderassemblement").default);
router.use("/lignebus", require("./lignebus"));
router.use("/schoolramses", require("./schoolramses"));
router.use("/mission", require("./mission").default);
router.use("/missionapi", require("./missionapi"));
router.use("/email", require("./email").default);
router.use("/application", require("./application").default);
router.use("/referent", require("./referent").default);
router.use("/dashboard", require("./dashboard/index"));
router.use("/association", require("./association").default);
router.use("/cle", require("./cle"));

export default router;
