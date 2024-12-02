import express from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import { UserRequest } from "../../controllers/request";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";
// import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { capture } from "../../sentry";
import { importSchemaDeRepartition } from "./SDRImportService";
import { ERRORS } from "snu-lib";

const router = express.Router();
router.use(authMiddleware("referent"));
router.post("/", accessControlMiddleware([]), fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }), async (req: UserRequest, res) => {
  try {
    const files = Object.values(req.files || {});
    if (files.length === 0) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const file: UploadedFile = files[0];
    if (file.mimetype !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const importedSchemaDeRepartition = await importSchemaDeRepartition(file.tempFilePath);

    return res.status(200).json({ ok: true, data: importedSchemaDeRepartition });
  } catch (error) {
    capture(error);
    console.log(error);
    return res.status(422).send({ ok: false, code: error.message });
  }
});
export default router;
