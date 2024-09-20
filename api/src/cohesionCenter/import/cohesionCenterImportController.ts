import express from "express";
import { RouteRequest } from "../../controllers/request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { cohesionCenterImportBodySchema } from "./cohesionCenterImportValidator";
import { generateCSVStream, getHeaders } from "../../services/fileService";
import { uploadFile } from "../../utils";
import { capture } from "../../sentry";
import { importCohesionCenter } from "./cohesionCenterImportService";
import { BasicRoute } from "snu-lib";
import { ImportCohesionCenterRoute } from "./cohesionCenterImport";

const router = express.Router();
router.use(authMiddleware("referent"));
router.post("/", accessControlMiddleware([]), requestValidatorMiddleware({ body: cohesionCenterImportBodySchema }), async (req: RouteRequest<ImportCohesionCenterRoute>, res) => {
  const validatedBody = req.validatedBody;
  try {
    const importedCohesionCenter = await importCohesionCenter(validatedBody.cohesionCenterFilePath);
    const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

    const headers = getHeaders(importedCohesionCenter);
    uploadFile(`file/center/${timestamp}-imported-cohesion-center.csv`, {
      data: generateCSVStream(importedCohesionCenter, headers),
      encoding: "",
      mimetype: "text/csv",
    });
    return res.status(200).send({ ok: true, data: importedCohesionCenter });
  } catch (error) {
    capture(error);
    return res.status(422).send({ ok: false, code: error.message });
  }
});
export default router;
