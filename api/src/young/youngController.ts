import express from "express";

import youngEmailController from "./email/youngEmailController";
import youngMissionsController from "./mission/youngMissionsController";

const router = express.Router();

router.use("/", youngEmailController);
router.use("/", youngMissionsController);

export default router;
