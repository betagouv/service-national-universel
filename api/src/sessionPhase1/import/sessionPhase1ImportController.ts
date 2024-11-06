import express from "express";
import { RouteRequest } from "../../controllers/request";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { capture } from "../../sentry";
import { generateCSVStream, getHeaders } from "../../services/fileService";
import { uploadFile } from "../../utils";
import { ImportSessionCohesionCenterRoute } from "./sessionPhase1Import";
import { importCohesionCenter } from "./sessionPhase1ImportService";
import { sessionCohesionCenterImportBodySchema } from "./sessionPhase1ImportValidator";

const router = express.Router();
router.use(authMiddleware("referent"));
router.post(
  "/",
  accessControlMiddleware([]),
  requestValidatorMiddleware({ body: sessionCohesionCenterImportBodySchema }),
  async (req: RouteRequest<ImportSessionCohesionCenterRoute>, res) => {
    const validatedBody = req.validatedBody;
    try {
      const importedSessionCohesionCenter = await importCohesionCenter(validatedBody.sessionCenterFilePath);
      const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

      const headers = getHeaders(importedSessionCohesionCenter);
      uploadFile(`file/session-center/${timestamp}-imported-session-cohesion-center.csv`, {
        data: generateCSVStream(importedSessionCohesionCenter, headers),
        encoding: "",
        mimetype: "text/csv",
      });
      return res.status(200).send({ ok: true, data: importedSessionCohesionCenter });
    } catch (error) {
      capture(error);
      return res.status(422).send({ ok: false, code: error.message });
    }
  },
);
export default router;
