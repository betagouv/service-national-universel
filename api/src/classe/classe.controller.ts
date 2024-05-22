import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";

import { ROLES, canDownloadYoungDocuments, YOUNG_STATUS, STATUS_CLASSE } from "snu-lib";

import { capture } from "../sentry";
import { ERRORS, isReferent } from "../utils";
import { CleClasseModel } from "../models";

import { UserRequest } from "../controllers/request";

import { generateConvocationsByClasseId } from "./classe.service";
import { findCohesionCentersForClasses, findPdrsForClasses, getYoungsGroupByClasses, findLigneInfoForClasses, findReferentInfoForClasses } from "./export/classeExportService";

const router = express.Router();
router.post(
  "/:id/convocations",
  passport.authenticate(["young", "referent"], {
    session: false,
    failWithError: true,
  }),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({ id: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, null, "convocation")) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      const { id } = value;
      const convocations = await generateConvocationsByClasseId(id);
      res.set({
        "content-length": convocations.length,
        "content-disposition": `inline; filename="convocations.pdf"`,
        "content-type": "application/pdf",
        "cache-control": "public, max-age=1",
      });
      res.send(convocations);
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: error.message });
    }
  },
);

router.post(
  "/export",
  passport.authenticate(["young", "referent"], {
    session: false,
    failWithError: true,
  }),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({ cohort: Joi.array().min(1).items(Joi.string()).required() })
        .unknown()
        .validate(req.body, { stripUnknown: true });
      if (error) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      if (![ROLES.ADMIN, ROLES.REFERENT_REGION].includes(req.user.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const allClasses = await CleClasseModel.find({
        cohort: value.cohort,
        status: { $in: [STATUS_CLASSE.INSCRIPTION_IN_PROGRESS, STATUS_CLASSE.INSCRIPTION_TO_CHECK, STATUS_CLASSE.VALIDATED] },
      })
        .populate({
          path: "etablissement",
        })
        .lean();

      // uniquement les classes de la région du référent
      const classes = allClasses.filter((classe) => req.user.role !== ROLES.REFERENT_REGION || classe.etablissement?.region === req.user.region);

      // const etablissements = await findEtablissementsForClasses(classes);
      const centres = await findCohesionCentersForClasses(classes);
      const pdrs = await findPdrsForClasses(classes);
      const youngs = await getYoungsGroupByClasses(classes);
      const lignesBus = await findLigneInfoForClasses(classes);
      const referents = await findReferentInfoForClasses(classes);

      for (let classe of classes) {
        // populate
        classe.cohesionCenter = centres?.find((e) => classe.cohesionCenterId === e._id.toString());
        classe.pointDeRassemblement = pdrs?.find((e) => classe.pointDeRassemblementId === e._id.toString());
        classe.ligne = lignesBus.find((e) => classe.ligneId === e._id.toString());
        classe.referentClasse = referents?.filter((e) => classe.referentClasseIds.includes(e._id.toString()));

        // calcul des effectifs
        const classeYoungs = youngs[classe._id];
        classe.studentInProgress = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.IN_PROGRESS || student.status === YOUNG_STATUS.WAITING_CORRECTION).length || 0;
        classe.studentWaiting = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.WAITING_VALIDATION).length || 0;
        classe.studentValidated = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.VALIDATED).length || 0;
        classe.studentAbandoned = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.ABANDONED).length || 0;
        classe.studentNotAutorized = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.NOT_AUTORISED).length || 0;
        classe.studentWithdrawn = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.WITHDRAWN).length || 0;
      }
      res.send({ ok: true, data: classes });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: error.message });
    }
  },
);
module.exports = router;
