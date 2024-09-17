import express from "express";
const router = express.Router();

router.use("/", require("./cohesionCenterController"));
router.use("/import", require("./import/cohesionCenterImportController").default);

export default router;
