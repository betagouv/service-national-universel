import express from "express";
const router = express.Router();

router.use("/point-de-rassemblement", require("./pointDeRassemblement").default);

export default router;
