import express from "express";
import fileUpload from "express-fileupload";
import { UploadedFile } from "express-fileupload";
import fs from "fs";

import { isSuperAdmin, ROLES } from "snu-lib";
import { ERRORS, uploadFile } from "../../../utils";
import { UserRequest } from "../../../controllers/request";
import { readCSVBuffer } from "../../../services/fileService";
import { capture } from "../../../sentry";
import { generateCSVStream, getHeaders, streamToBuffer, XLSXToCSVBuffer } from "../../../services/fileService";
import { accessControlMiddleware } from "../../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../../middlewares/authMiddleware";

import { updateClasseFromExport } from "./classeImportAutoService";
import { ClasseFromCSV } from "./classeImportAutoType";

const router = express.Router();
router.use(authMiddleware("referent"));
const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

router.post(
  "/classe-importAuto",
  [accessControlMiddleware([ROLES.ADMIN])],
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res) => {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    try {
      const files = Object.values(req.files || {});
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      const file: UploadedFile = files[0];
      if (file.mimetype !== xlsxMimetype) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      const filePath = file.tempFilePath;
      const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

      const data = fs.readFileSync(filePath);

      uploadFile(`file/appelAProjet/import/import-classe/import-${timestamp}/${timestamp}-exported-classes.xlsx`, {
        data: data,
        encoding: "",
        mimetype: xlsxMimetype,
      });

      const csvBuffer = XLSXToCSVBuffer(filePath);
      const parsedContent: ClasseFromCSV[] = await readCSVBuffer(csvBuffer);
      const importedClasseCohort = await updateClasseFromExport(parsedContent);

      const headers = getHeaders(importedClasseCohort);
      const csvDataReponse = generateCSVStream(importedClasseCohort, headers);
      uploadFile(`file/appelAProjet/import/import-classe/import-${timestamp}/${timestamp}-updated-classes.csv`, {
        data: csvDataReponse,
        encoding: "",
        mimetype: "text/csv",
      });

      const csvBufferResponse = Buffer.from(await streamToBuffer(csvDataReponse));

      return res.status(200).send({
        data: csvBufferResponse.toString("base64"),
        mimeType: "text/csv",
        fileName: `${timestamp}-updated-classes.csv`,
        ok: true,
      });
    } catch (error) {
      capture(error);
      return res.status(422).send({ ok: false, code: error.message });
    }
  },
);

export default router;
