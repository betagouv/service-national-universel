import express, { Response } from "express";
import Joi from "joi";
import passport from "passport";

import { canSearchStudent, ROLES, YOUNG_STATUS, YoungDto } from "snu-lib";

import { validateId, idSchema } from "../../utils/validator";
import { ERRORS } from "../../utils";
import { capture } from "../../sentry";
import { ClasseModel, YoungModel, EtablissementModel } from "../../models";
import { UserRequest } from "../../controllers/request";
import { getValidatedYoungsWithSession, getYoungsImageRight, getYoungsParentAllowSNU } from "../../young/youngService";
import patches from "../../controllers/patches";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";

const router = express.Router();
router.use(authMiddleware("referent"));

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

router.get(
  "/by-classe-historic/:idClasse/patches",
  [
    requestValidatorMiddleware({
      params: Joi.object({ idClasse: idSchema().required() }),
    }),
    accessControlMiddleware([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE]),
  ],
  async (req: UserRequest, res) => {
    try {
      const id = req.params.idClasse;

      const classe = await ClasseModel.findById(id);
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const youngs = await YoungModel.find({ classeId: classe._id });

      const youngPatches: any = [];

      const pathsToFilter = ["/status"];

      const promises = youngs.map(async (young) => {
        let youngPatche = await patches.get({ params: { id: young._id.toString() }, user: req.user }, YoungModel);

        if (!youngPatche) {
          throw new Error(`patch not found for young ${young._id}`);
        }

        youngPatche.forEach((patch) => {
          patch.ops = patch.ops.filter((op) => pathsToFilter.includes(op.path));
        });

        youngPatche = youngPatche.filter((patch) => patch.ops.length > 0);

        youngPatche.forEach((patch) => {
          patch.young = { firstName: young.firstName, lastName: young.lastName };
        });

        return youngPatche;
      });

      try {
        const results = await Promise.all(promises);
        results.forEach((result) => {
          youngPatches.push(...result);
        });
      } catch (error) {
        throw new Error(error);
      }

      return res.status(200).send({ ok: true, data: youngPatches });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

//Cette route recupere les patches des anciens élèves qui sont passés par la classe mais n'y sont plus
router.get(
  "/by-classe-historic/:idClasse/patches/old-student",
  [
    requestValidatorMiddleware({
      params: Joi.object({ idClasse: idSchema().required() }),
    }),
    accessControlMiddleware([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE]),
  ],
  async (req: UserRequest, res) => {
    try {
      const id = req.params.idClasse;

      const classe = await ClasseModel.findById(id);
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      let youngPatches = await patches.getOldStudentPatches({ classeId: id, user: req.user });

      const pathsToFilter = ["/classeId"];

      const promises = youngPatches.map(async (youngPatch) => {
        const young = await YoungModel.findById(youngPatch.ref);
        if (!young) {
          throw new Error(`Young not found ${youngPatch.ref}`);
        }
        youngPatch.ops = youngPatch.ops.filter((op) => pathsToFilter.includes(op.path));
        youngPatch.young = { firstName: young.firstName, lastName: young.lastName };
        youngPatch.oldStudent = true;
        return youngPatch;
      });

      try {
        youngPatches = await Promise.all(promises);
      } catch (error) {
        throw new Error(error);
      }

      return res.status(200).send({ ok: true, data: youngPatches });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
