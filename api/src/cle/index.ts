import express from "express";
const router = express.Router();

router.use("/classe", require("./classe/classeController"));
router.use("/etablissement", require("./etablissement/etablissementController"));
router.use("/appel-a-projet", require("./appelAProjetCle/appelAProjetController"));

module.exports = router;
