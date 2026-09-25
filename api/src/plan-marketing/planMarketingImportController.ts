import express from "express";
import passport from "passport";
import fs from "fs";
import { RouteRequest, RouteResponse } from "../controllers/request";
import { authMiddleware } from "../middlewares/authMiddleware";
import { capture } from "../sentry";
import { ERRORS, uploadFile } from "../utils";
import { toErrorCode } from "../utils/errorCode";
import { assertImportedFile, buildImportedFileKey, removeTempFile } from "../utils/importedFile";
import fileUpload, { UploadedFile } from "express-fileupload";
import { MIME_TYPES, PLAN_MARKETING_FOLDER_PATH_EXPORT, PlanMarketingRoutes, isSuperAdmin } from "snu-lib";

const router = express.Router();
router.use(authMiddleware("referent"));

router.post(
  "/",
  passport.authenticate("referent", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 8 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: RouteRequest<PlanMarketingRoutes["ImportContacts"]>, res: RouteResponse<PlanMarketingRoutes["ImportContacts"]>) => {
    const file: UploadedFile | undefined = Object.values(req.files || {})[0] as UploadedFile | undefined;
    try {
      if (!isSuperAdmin(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
      if (!file || file.mimetype !== MIME_TYPES.CSV || !file.name) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      await assertImportedFile(file, "csv", req.user._id?.toString());

      // Chemin généré côté serveur (L32) : le client le reçoit en retour et le transmet tel quel à apiv2
      // pour créer la liste de diffusion (`PLAN_MARKETING_PATH_FILE_REGEX`).
      const filePath = buildImportedFileKey(PLAN_MARKETING_FOLDER_PATH_EXPORT, "csv");
      await uploadFile(filePath, {
        data: fs.readFileSync(file.tempFilePath),
        encoding: "",
        mimetype: MIME_TYPES.CSV,
      });

      return res.status(200).json({ ok: true, data: filePath });
    } catch (error) {
      capture(error);
      return res.status(422).json({ ok: false, code: toErrorCode(error, ERRORS.FILE_CORRUPTED) });
    } finally {
      removeTempFile(file);
    }
  },
);
export default router;
