import express from "express";
const router = express.Router();

router.use("/import", require("./SDRImportController").default);

export default router;
