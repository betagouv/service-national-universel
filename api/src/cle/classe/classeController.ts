import express, { Response } from "express";
import Joi from "joi";

import { canViewClasse, ClassesRoutes, ROLES, STATUS_CLASSE, YOUNG_STATUS, ReferentType } from "snu-lib";

import { capture, captureMessage } from "../../sentry";
import { ERRORS } from "../../utils";
import { idSchema, validateId } from "../../utils/validator";
import { RouteRequest, RouteResponse, UserRequest } from "../../controllers/request";
import { ClasseDocument, ClasseModel, CohesionCenterDocument, LigneBusDocument, PointDeRassemblementDocument, ReferentDocument, ReferentModel } from "../../models";

import patches from "../../controllers/patches";
import { ClassesRoutesSchema } from "./classeValidator";
import { getClasseById, getClasseByIdPublic } from "./classeService";

import {
  findChefEtablissementInfoForClasses,
  findCohesionCentersForClasses,
  findLigneInfoForClasses,
  findPdrsForClasses,
  getYoungsGroupByClasses,
} from "./export/classeExportService";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { isEtablissementInUserScope } from "../etablissement/etablissementScope";

/**
 * Champs des référents de classe exposés au front (création de classe, exports).
 *
 * Projection explicite : un document référent brut contient `invitationToken`,
 * `forgotPasswordResetToken` et `token2FA`, c'est-à-dire de quoi prendre le contrôle du compte.
 */
const REFERENT_CLASSE_PUBLIC_FIELDS = "_id firstName lastName email phone role status";

const router = express.Router();
router.use(authMiddleware("referent"));
router.post("/export", async (req: UserRequest, res: Response) => {
  try {
    const allowedRoles = req.query.type === "schema-de-repartition" ? [ROLES.ADMIN, ROLES.REFERENT_REGION] : [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const queryParams = {};

    if (req.query.type === "schema-de-repartition") {
      // Validate the request body
      const validation = Joi.object({ cohort: Joi.array().min(1).items(Joi.string()).required() })
        .unknown()
        .validate(req.body, { stripUnknown: true });

      if (validation.error) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      queryParams["cohort"] = req.body.cohort;
      queryParams["status"] = { $in: [STATUS_CLASSE.OPEN, STATUS_CLASSE.CLOSED] };
    }

    if (req.user.role === ROLES.REFERENT_REGION) queryParams["region"] = req.user.region;
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) queryParams["department"] = req.user.department;

    const classes: ClasseDocument<{
      cohesionCenter?: CohesionCenterDocument;
      pointDeRassemblement?: PointDeRassemblementDocument;
      ligne?: LigneBusDocument;
      studentInProgress?: number;
      studentWaiting?: number;
      studentValidated?: number;
      studentAbandoned?: number;
      studentNotAutorized: number;
      studentWithdrawn?: number;
      referentEtablissement?: ReferentDocument[];
    }>[] = await ClasseModel.find(queryParams)
      .populate({
        path: "etablissement",
      })
      .populate({
        path: "referents",
        select: REFERENT_CLASSE_PUBLIC_FIELDS,
      })
      .lean();

    if (req.query.type === "schema-de-repartition") {
      const centres = await findCohesionCentersForClasses(classes);
      const pdrs = await findPdrsForClasses(classes);
      const youngs = await getYoungsGroupByClasses(classes);
      const lignesBus = await findLigneInfoForClasses(classes);

      for (const classe of classes) {
        // populate
        classe.cohesionCenter = centres?.find((e) => classe.cohesionCenterId === e._id.toString());
        classe.pointDeRassemblement = pdrs?.find((e) => classe.pointDeRassemblementId === e._id.toString());
        classe.ligne = lignesBus.find((e) => classe.ligneId === e._id.toString());

        // calcul des effectifs
        const classeYoungs = youngs[classe._id];
        classe.studentInProgress = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.IN_PROGRESS || student.status === YOUNG_STATUS.WAITING_CORRECTION).length || 0;
        classe.studentWaiting = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.WAITING_VALIDATION).length || 0;
        classe.studentValidated = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.VALIDATED).length || 0;
        classe.studentAbandoned = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.ABANDONED).length || 0;
        classe.studentNotAutorized = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.NOT_AUTORISED).length || 0;
        classe.studentWithdrawn = classeYoungs?.filter((student) => student.status === YOUNG_STATUS.WITHDRAWN).length || 0;
      }
    } else if (req.query.type === "export-des-classes") {
      const chefEtablissement = await findChefEtablissementInfoForClasses(classes);
      for (let classe of classes) {
        classe.referentEtablissement = chefEtablissement?.filter((ce) => classe.etablissement?.referentEtablissementIds.includes(ce._id.toString()));
      }
    }
    res.send({ ok: true, data: classes });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: error.message });
  }
});

router.get(
  "/:id",
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
      query: Joi.object({ withDetails: Joi.boolean().default(true) }),
    }),
    accessControlMiddleware([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN]),
  ],
  async (req: RouteRequest<ClassesRoutes["GetOne"]>, res: RouteResponse<ClassesRoutes["GetOne"]>) => {
    try {
      const { validatedParams, validatedQuery } = req;

      const data = await getClasseById(validatedParams.id, validatedQuery?.withDetails);

      return res.status(200).json({ ok: true, data: data?.toJSON() });
    } catch (error) {
      capture(error);
      if (error.message === "Classe not found") {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get("/public/:id", async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // Validate and transform query parameters
    const { error: queryError, value: queryParams } = ClassesRoutesSchema.GetOne.query.validate(req.query);
    if (queryError) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: queryError.message });
    }

    const data = await getClasseByIdPublic(id, queryParams?.withDetails);

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    if (error.message === "Classe not found") {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/from-etablissement/:id", async (req: UserRequest, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (!(await isEtablissementInUserScope(req.user, value))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const classes: ClasseDocument<{ referent: Array<ReferentType | null> }>[] = await ClasseModel.find({ etablissementId: value })?.lean();
    if (!classes) {
      captureMessage("Error finding classe with etablissementId : " + JSON.stringify(value));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const findReferentsById = async (referentClasseIds) => {
      const uniqueReferentIds = [...new Set(referentClasseIds)];
      const referentsPromises = uniqueReferentIds.map((referentId) => {
        return ReferentModel.findById(referentId).select(REFERENT_CLASSE_PUBLIC_FIELDS).lean();
      });
      return Promise.all(referentsPromises);
    };
    for (const classe of classes) {
      const referents = await findReferentsById(classe.referentClasseIds);
      classe.referent = referents;
    }

    return res.status(200).send({ ok: true, data: classes });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get(
  "/:id/patches",
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    accessControlMiddleware([ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN]),
  ],
  async (req: UserRequest, res) => {
    try {
      const id = req.params.id;

      const classe = await ClasseModel.findById(id);
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      let classePatches = await patches.get(req, ClasseModel);
      if (!classePatches) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const pathsToIgnore = ["/seatsTaken", "/cohortId", "/uniqueKey", "/uniqueId", "/comments", "/trimester", "/metadata", "/id", "/updatedAt", "/referents"];
      classePatches.forEach((patch) => {
        patch.ops = patch.ops.filter((op) => !pathsToIgnore.includes(op.path));
        patch.ops.forEach((op) => {
          if (op.path === "/status") {
            op.path = "/classeStatus";
          }
        });
      });
      classePatches = classePatches.filter((patch) => patch.ops.length > 0);

      return res.status(200).send({ ok: true, data: classePatches });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: error.message });
    }
  },
);

export default router;
