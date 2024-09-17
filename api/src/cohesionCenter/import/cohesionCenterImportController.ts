import express from "express";
import { UserRequest } from "../../controllers/request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";

const router = express.Router();
router.use(authMiddleware("referent"));
router.post("/", accessControlMiddleware([]), async (req: UserRequest, res) => {
  // TODO: Implement
});
export default router;
