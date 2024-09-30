import express from "express";
import { RouteRequest, RouteResponse } from "../../../controllers/request";
import { accessControlMiddleware } from "../../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { requestValidatorMiddleware } from "../../../middlewares/requestValidatorMiddleware";
import { capture } from "../../../sentry";
import { generateCSVStream, getHeaders } from "../../../services/fileService";
import { uploadFile } from "../../../utils";
import { ImportPointDeRassemblementRoute } from "./pointDeRassemblementImport";
import { importPointDeRassemblement } from "./pointDeRassemblementImportService";
import { pdrImportBodySchema } from "./pointDeRassemblementImportValidator";

const router = express.Router();
router.use(authMiddleware("referent"));
router.post(
  "/",
  accessControlMiddleware([]),
  requestValidatorMiddleware({ body: pdrImportBodySchema }),
  async (req: RouteRequest<ImportPointDeRassemblementRoute>, res: RouteResponse<ImportPointDeRassemblementRoute>) => {
    const validatedBody = req.validatedBody;
    try {
      const importedPointDeRassemblement = await importPointDeRassemblement(validatedBody.pdrFilePath);
      const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

      const headers = getHeaders(importedPointDeRassemblement);
      uploadFile(`file/point-de-rassemblement/${timestamp}-imported-pointderassemblement.csv`, {
        data: generateCSVStream(importedPointDeRassemblement, headers),
        encoding: "",
        mimetype: "text/csv",
      });
      return res.status(200).json({ ok: true, data: importedPointDeRassemblement });
    } catch (error) {
      capture(error);
      console.log(error);
      return res.status(422).send({ ok: false, code: error.message });
    }
  },
);
export default router;
