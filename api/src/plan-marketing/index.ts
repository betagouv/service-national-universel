import express from "express";
const router = express.Router();

router.use("/import", require("./planMarketingImportController").default);

export default router;
