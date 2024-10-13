import express from "express";
const router = express.Router();

router.use("/", require("./pointDeRassemblementController").default);
router.use("/import", require("./import/pointDeRassemblementImportController").default);

export default router;
