import express from "express";
import fs from "fs";
import { RouteResponse, UserRequest } from "../../../controllers/request";
import { accessControlMiddleware } from "../../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { capture } from "../../../sentry";
import { generateCSVStream, getHeaders, streamToBuffer } from "../../../services/fileService";
import { ERRORS, uploadFile } from "../../../utils";
import { ImportPointDeRassemblementRoute } from "./pointDeRassemblementImport";
import { importPointDeRassemblement } from "./pointDeRassemblementImportService";
import fileUpload, { UploadedFile } from "express-fileupload";
import { MIME_TYPES, SENDINBLUE_TEMPLATES } from "snu-lib";
import { sendTemplate } from "../../../brevo";

const router = express.Router();
router.use(authMiddleware("referent"));

router.post(
  "/",
  accessControlMiddleware([]),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res: RouteResponse<ImportPointDeRassemblementRoute>) => {
    const files = Object.values(req.files || {});
    if (files.length === 0) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const file: UploadedFile = files[0];
    if (file.mimetype !== MIME_TYPES.EXCEL) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    } else if (!file.name) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    try {
      // read XLSX
      const data = fs.readFileSync(file.tempFilePath);
      uploadFile(`file/point-de-rassemblement/${file.name}`, {
        data: data,
        encoding: "",
        mimetype: MIME_TYPES.EXCEL,
      });

      const importedPointDeRassemblement = await importPointDeRassemblement(data);

      const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
      const rapportHeaders = getHeaders(importedPointDeRassemblement);
      const rapportDataStream = generateCSVStream(importedPointDeRassemblement, rapportHeaders);
      const rapportFileName = `${timestamp}-imported-pointderassemblement.csv`;
      uploadFile(`file/point-de-rassemblement/${rapportFileName}`, {
        data: rapportDataStream,
        encoding: "",
        mimetype: "text/csv",
      });

      // Send report to email
      const attachmentData = Buffer.from(await streamToBuffer(rapportDataStream)).toString("base64");
      await sendTemplate(SENDINBLUE_TEMPLATES.IMPORT_AUTO, {
        emailTo: [{ name: `${req.user.firstName} ${req.user.lastName}`, email: req.user.email! }],
        attachment: [{ content: attachmentData, name: rapportFileName }],
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
