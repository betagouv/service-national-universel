import express from "express";

import youngEmailController from "./email/youngEmailController";

const router = express.Router();

router.use("/", youngEmailController);

export default router;
