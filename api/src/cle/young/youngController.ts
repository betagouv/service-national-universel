import express, { Response } from "express";
import passport from "passport";

import { canSearchStudent, ROLES, YOUNG_STATUS, YoungDto } from "snu-lib";

import { validateId } from "../../utils/validator";
import { ERRORS } from "../../utils";
import { capture } from "../../sentry";
import { ClasseModel, YoungModel, EtablissementModel } from "../../models";
import { UserRequest } from "../../controllers/request";
import { getValidatedYoungsWithSession, getYoungsImageRight, getYoungsParentAllowSNU } from "../../young/youngService";

const router = express.Router();

router.get("/by-classe-stats/:idClasse", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = validateId(req.params.idClasse);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canSearchStudent(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const classe = await ClasseModel.findOne({ _id: value })?.lean();
    if (!classe) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (req.user.role === ROLES.REFERENT_CLASSE && !classe.referentClasseIds.includes(req.user._id.toString()))
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (req.user.role === ROLES.ADMINISTRATEUR_CLE) {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (!etablissement.referentEtablissementIds.includes(req.user._id.toString()) && !etablissement.coordinateurIds.includes(req.user._id.toString())) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    const students: YoungDto[] = await YoungModel.find({ classeId: value });

    const statusCount = students.reduce((acc, student) => {
      const status = student.status || "";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const parentAllowSNUCount = getYoungsParentAllowSNU(students).length;
    const studentImageRightCount = getYoungsImageRight(students).length;
    const validatedYoungsWithSession = getValidatedYoungsWithSession(students).length;

    const result = { parentAllowSNU: parentAllowSNUCount, imageRight: studentImageRightCount, youngWithSession: validatedYoungsWithSession, total: students.length };
    Object.keys(statusCount).forEach((status) => {
      result[YOUNG_STATUS[status]] = statusCount[status];
    });

    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
