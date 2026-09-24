import express from "express";
const router = express.Router();

router.use("/", require("./cohesionCenterController"));

export default router;
