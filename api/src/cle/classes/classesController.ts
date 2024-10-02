import express from "express";
import passport from "passport";
import { UserRequest } from "../../controllers/request";
import { UpdateReferentClasse } from "../classe/classeService";
import { capture } from "../../sentry";
import { isSuperAdmin } from "snu-lib";
import { ERRORS } from "../../utils";
import { updateReferentsForMultipleClasses } from "./classesService";
import { readCSVBuffer } from "../../services/fileService";
import fileUpload from "express-fileupload";
import { updateReferentsClassesSchema } from "./classesValidator";

const router = express.Router();

router.put("/update-referents", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const { error, value: referentsClassesToUpdate } = updateReferentsClassesSchema.validate(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const report = await updateReferentsForMultipleClasses(referentsClassesToUpdate, req.user);
    return res.status(200).json({ ok: true, data: report });
  } catch (error) {
    capture(error);
    res.status(422).send({ ok: false, code: error.message });
  }
});

router.put(
  "/update-referents-by-csv",
  passport.authenticate("referent", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: false }),
  async (req: UserRequest, res) => {
    try {
      if (!isSuperAdmin(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
      const files = Object.values(req.files || {});
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      const file = files[0] as { data: Buffer };
      const referentsClassesToUpdate = await readCSVBuffer<
        UpdateReferentClasse & {
          idClasse: string;
        }
      >(file.data, true);
      console.log(referentsClassesToUpdate);

      const { error, value: referentsClassesToUpdateValidated } = updateReferentsClassesSchema.validate(referentsClassesToUpdate);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      const report = await updateReferentsForMultipleClasses(referentsClassesToUpdateValidated, req.user);
      return res.status(200).json({ ok: true, data: report });
    } catch (error) {
      capture(error);
      res.status(422).send({ ok: false, code: error.message });
    }
  },
);
export default router;
