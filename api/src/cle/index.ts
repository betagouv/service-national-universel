import express from "express";
const router = express.Router();

router.use("/appel-a-projet", require("./appelAProjetCle/appelAProjetController").default);
router.use("/classe", require("./classe/classeController").default);
router.use("/classe/import", require("./classe/import/classeImportController").default);
router.use("/classe/importAuto", require("./classe/importAuto/classeImportAutoController").default);
router.use("/etablissement", require("./etablissement/etablissementController").default);
router.use("/referent", require("./referent/referentController").default);
router.use("/referent-signup", require("./referent/referentSignupController").default);
router.use("/young", require("./young/youngController").default);
router.use("/classes", require("./classes/classesController").default);

export default router;
