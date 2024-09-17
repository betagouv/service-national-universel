// @ts-ignore
import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { ROLES } from "snu-lib";

const router = express.Router();
router.use(authMiddleware("referent"));
router.get("/admin", accessControlMiddleware([ROLES.ADMIN]), (req, res) => {
  res.sendStatus(200);
});
router.get("/referent-classe", accessControlMiddleware([ROLES.REFERENT_CLASSE]), (req, res) => {
  res.sendStatus(200);
});

router.get("/public", (req, res) => {
  res.sendStatus(200);
});

router.get("/unprotected", (req, res) => {
  res.sendStatus(200);
});
export default router;
