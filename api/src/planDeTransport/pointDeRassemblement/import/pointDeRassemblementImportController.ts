import express from "express";
import fs from "fs";
import { RouteResponse, UserRequest } from "../../../controllers/request";
import { accessControlMiddleware } from "../../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { capture } from "../../../sentry";
import { generateCSVStream, getHeaders, streamToBuffer } from "../../../services/fileService";
import { ERRORS, uploadFile } from "../../../utils";
import { toErrorCode } from "../../../utils/errorCode";
import { assertImportedFile, buildImportedFileKey, removeTempFile } from "../../../utils/importedFile";
import { ImportPointDeRassemblementRoute } from "./pointDeRassemblementImport";
import { importPointDeRassemblement, PointDeRassemblementImportHeadersError } from "./pointDeRassemblementImportService";
import fileUpload, { UploadedFile } from "express-fileupload";
import { MIME_TYPES, SENDINBLUE_TEMPLATES } from "snu-lib";
import { sendTemplate } from "../../../brevo";

const IMPORT_FOLDER = "file/point-de-rassemblement";

const router = express.Router();
router.use(authMiddleware("referent"));

router.post(
  "/",
  accessControlMiddleware([]),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res: RouteResponse<ImportPointDeRassemblementRoute>) => {
    const file: UploadedFile | undefined = Object.values(req.files || {})[0] as UploadedFile | undefined;
    try {
      if (!file || file.mimetype !== MIME_TYPES.EXCEL || !file.name) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      await assertImportedFile(file, "xlsx", req.user._id?.toString());

      // read XLSX
      const data = fs.readFileSync(file.tempFilePath);
      // Clé générée côté serveur : le nom du fichier client n'y entre pas (L33).
      await uploadFile(buildImportedFileKey(IMPORT_FOLDER, "xlsx"), {
        data: data,
        encoding: "",
        mimetype: MIME_TYPES.EXCEL,
      });

      const importedPointDeRassemblement = await importPointDeRassemblement(data);

      const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
      const rapportHeaders = getHeaders(importedPointDeRassemblement);
      // Un flux ne se lit qu'une fois : le rapport est matérialisé avant d'être stocké et envoyé.
      const rapportData = Buffer.from(await streamToBuffer(generateCSVStream(importedPointDeRassemblement, rapportHeaders)));
      const rapportFileName = `${timestamp}-imported-pointderassemblement.csv`;
      await uploadFile(`${IMPORT_FOLDER}/${rapportFileName}`, {
        data: rapportData,
        encoding: "",
        mimetype: "text/csv",
      });

      // Send report to email
      await sendTemplate(SENDINBLUE_TEMPLATES.IMPORT_AUTO, {
        emailTo: [{ name: `${req.user.firstName} ${req.user.lastName}`, email: req.user.email! }],
        attachment: [{ content: rapportData.toString("base64"), name: rapportFileName }],
      });

      return res.status(200).json({ ok: true });
    } catch (error) {
      if (error instanceof PointDeRassemblementImportHeadersError) {
        return res.status(422).json({ ok: false, code: ERRORS.INVALID_BODY, message: error.message });
      }
      capture(error);
      // Seul un code est renvoyé : le message d'une erreur technique décrit l'implémentation (L33).
      return res.status(422).json({ ok: false, code: toErrorCode(error, ERRORS.FILE_CORRUPTED) });
    } finally {
      removeTempFile(file);
    }
  },
);
export default router;
