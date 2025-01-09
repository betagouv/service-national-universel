import express from "express";
import fileUpload from "express-fileupload";
import { UploadedFile } from "express-fileupload";
import fs from "fs";

import { isSuperAdmin, SENDINBLUE_TEMPLATES } from "snu-lib";
import { sendTemplate } from "../../brevo";
import { UserRequest } from "../../controllers/request";
import { ERRORS, uploadFile } from "../../utils";
import { readCSVBuffer, generateCSVStream, getHeaders, streamToBuffer, XLSXToCSVBuffer, getHeadersFromXLSX } from "../../services/fileService";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { capture } from "../../sentry";
import { importSessionsPhase1 } from "./sessionPhase1ImportService";
import { sessionPhase1ImportValidator } from "./sessionPhase1ImportValidator";
import { SessionCohesionCenterCSV } from "./sessionPhase1Import";

const router = express.Router();
router.use(authMiddleware("referent"));
const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

router.post("/", [accessControlMiddleware([])], fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }), async (req: UserRequest, res) => {
  if (!isSuperAdmin(req.user)) {
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
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const filePath = file.tempFilePath;
    const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

    const data = fs.readFileSync(filePath);
    const fileHeaders = getHeadersFromXLSX(filePath);
    sessionPhase1ImportValidator(fileHeaders);

    uploadFile(`file/si-snu/centres-des-sessions/export-${timestamp}/export-si-snu-sessions-${timestamp}.xlsx`, {
      data: data,
      encoding: "",
      mimetype: xlsxMimetype,
    });

    const csvBuffer = XLSXToCSVBuffer(filePath);
    const parsedContent: SessionCohesionCenterCSV[] = await readCSVBuffer(csvBuffer);
    const importedSessionCohesionCenter = await importSessionsPhase1(parsedContent);

    const headers = getHeaders(importedSessionCohesionCenter);
    const csvDataReponse = generateCSVStream(importedSessionCohesionCenter, headers);
    const responseFileName = `rapport-sessions-importes-${timestamp}.csv`;
    uploadFile(`file/si-snu/centres-des-sessions/export-${timestamp}/${responseFileName}`, {
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
});

export default router;
