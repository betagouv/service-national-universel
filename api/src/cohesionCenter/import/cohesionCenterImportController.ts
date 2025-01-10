import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";

import { SENDINBLUE_TEMPLATES } from "snu-lib";
import { sendTemplate } from "../../brevo";
import { UserRequest } from "../../controllers/request";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { capture } from "../../sentry";
import { generateCSVStream, getHeaders, streamToBuffer } from "../../services/fileService";
import { ERRORS, uploadFile } from "../../utils";
import { buildPathOnBucket, checkColumnHeaders, importCohesionCenter, uploadAndConvertFile, xlsxMimetype } from "./cohesionCenterImportService";

const router = express.Router();
router.use(authMiddleware("referent"));
router.post("/", accessControlMiddleware([]), fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }), async (req: UserRequest, res) => {
  try {
    // Process uploaded file
    const user = req.user;
    const files = Object.values(req.files || {});
    if (files.length === 0) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const file: UploadedFile = files[0];
    if (file.mimetype !== xlsxMimetype) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
    const fileData = await uploadAndConvertFile(file.tempFilePath, timestamp);
    const fileHeaders = getHeaders<object>(fileData);
    checkColumnHeaders(fileHeaders);
    const importedCohesionCenter = await importCohesionCenter(fileData);

    // Upload report
    const responseHeaders = getHeaders(importedCohesionCenter);
    const csvDataReponse = generateCSVStream(importedCohesionCenter, responseHeaders);
    const responseFileName = `rapport-centres-importes-${timestamp}.csv`;
    uploadFile(`${buildPathOnBucket(timestamp)}/${responseFileName}`, {
      data: generateCSVStream(importedCohesionCenter, responseHeaders),
      encoding: "",
      mimetype: "text/csv",
    });

    // Send email
    const csvBufferResponse = Buffer.from(await streamToBuffer(csvDataReponse));
    const contentData = csvBufferResponse.toString("base64");
    await sendTemplate(SENDINBLUE_TEMPLATES.CLE.IMPORT_DES_CLASSES, {
      emailTo: [{ name: `${user.firstName} ${user.lastName}`, email: user.email! }],
      attachment: [{ content: contentData, name: responseFileName }],
    });

    return res.status(200).send({ ok: true, data: importedCohesionCenter });
  } catch (error) {
    capture(error);
    return res.status(422).send({ ok: false, code: error.message });
  }
});
export default router;
