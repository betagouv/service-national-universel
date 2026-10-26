import express from "express";
const router = express.Router();

router.use("/", require("./pointDeRassemblementController").default);

export default router;
