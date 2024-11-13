import express from "express";
import fileUpload from "express-fileupload";
import { UploadedFile } from "express-fileupload";
import fs from "fs";

import { isSuperAdmin, SENDINBLUE_TEMPLATES } from "snu-lib";
import { sendTemplate } from "../../../brevo";
import { ERRORS, uploadFile } from "../../../utils";
import { UserRequest } from "../../../controllers/request";
import { capture } from "../../../sentry";
import { readCSVBuffer, generateCSVStream, getHeaders, streamToBuffer, XLSXToCSVBuffer } from "../../../services/fileService";
import { accessControlMiddleware } from "../../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../../middlewares/authMiddleware";

import { updateClasseFromExport } from "./classeImportAutoService";
import { ClasseFromCSV } from "./classeImportAutoType";

const router = express.Router();
router.use(authMiddleware("referent"));
const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

router.post(
  "/classe-importAuto",
  [accessControlMiddleware([])],
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res) => {
    console.log("LAAAAA");
    if (!isSuperAdmin(req.user)) {
      console.log("error ADMIN");
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    try {
      const user = req.user;
      const files = Object.values(req.files || {});
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      const file: UploadedFile = files[0];
      if (file.mimetype !== xlsxMimetype) {
        console.log("error mimetype");
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      console.log("ICIII");
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
      const responseFileName = `${timestamp}-updated-classes.csv`;
      uploadFile(`file/appelAProjet/import/import-classe/import-${timestamp}/${responseFileName}`, {
        data: csvDataReponse,
        encoding: "",
        mimetype: "text/csv",
      });

      const csvBufferResponse = Buffer.from(await streamToBuffer(csvDataReponse));

      const contentData = csvBufferResponse.toString("base64");

      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.IMPORT_DES_CLASSES, {
        emailTo: [{ name: `${user.firstName} ${user.lastName}`, email: user.email! }],
        attachment: [{ content: contentData, name: responseFileName }],
      });

      return res.status(200).send({
        data: contentData,
        mimeType: "text/csv",
        fileName: responseFileName,
        ok: true,
      });
    } catch (error) {
      capture(error);
      return res.status(422).send({ ok: false, code: error.message });
    }
  },
);

export default router;
