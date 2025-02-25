import express from "express";
import passport from "passport";
import fs from "fs";
import { RouteRequest, RouteResponse } from "../controllers/request";
import { authMiddleware } from "../middlewares/authMiddleware";
import { capture } from "../sentry";
import { ERRORS, uploadFile } from "../utils";
import fileUpload, { UploadedFile } from "express-fileupload";
import { MIME_TYPES, PLAN_MARKETING_FOLDER_PATH_EXPORT, PlanMarketingRoutes, isSuperAdmin } from "snu-lib";

const router = express.Router();
router.use(authMiddleware("referent"));

router.post(
  "/",
  passport.authenticate("referent", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 8 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: RouteRequest<PlanMarketingRoutes["ImportContacts"]>, res: RouteResponse<PlanMarketingRoutes["ImportContacts"]>) => {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const files = Object.values(req.files || {});
    if (files.length === 0) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const file: UploadedFile = files[0];
    if (file.mimetype !== MIME_TYPES.CSV) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    } else if (!file.name) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    try {
      const data = fs.readFileSync(file.tempFilePath);
      uploadFile(`${PLAN_MARKETING_FOLDER_PATH_EXPORT}/${file.name}`, {
        data: data,
        encoding: "",
        mimetype: MIME_TYPES.CSV,
      });

      return res.status(200).json({ ok: true });
    } catch (error) {
      capture(error);
      console.log(error);
      return res.status(422).json({ ok: false, code: ERRORS.FILE_CORRUPTED, message: error.message });
    }
  },
);
export default router;
