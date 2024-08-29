import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";

import {
  canCreateClasse,
  canDeleteClasse,
  canDownloadYoungDocuments,
  canEditEstimatedSeats,
  canEditTotalSeats,
  canNotifyAdminCleForVerif,
  canUpdateClasse,
  canUpdateClasseStay,
  canUpdateCohort,
  canUpdateReferentClasse,
  canVerifyClasse,
  canViewClasse,
  canWithdrawClasse,
  ClasseSchoolYear,
  CLE_COLORATION_LIST,
  CLE_FILIERE_LIST,
  CLE_GRADE_LIST,
  CohortDto,
  FeatureFlagName,
  isAdmin,
  LIMIT_DATE_ESTIMATED_SEATS,
  ROLES,
  SENDINBLUE_TEMPLATES,
  STATUS_CLASSE,
  STATUS_PHASE1_CLASSE,
  TYPE_CLASSE_LIST,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
} from "snu-lib";

import { capture, captureMessage } from "../../sentry";
import { ERRORS, isReferent } from "../../utils";
import { validateId } from "../../utils/validator";
import emailsEmitter from "../../emails";
import { UserRequest } from "../../controllers/request";
import {
  ClasseDocument,
  ClasseModel,
  CohesionCenterDocument,
  CohortModel,
  EtablissementDocument,
  EtablissementModel,
  LigneBusDocument,
  PointDeRassemblementDocument,
  ReferentDocument,
  ReferentModel,
  ReferentType,
  YoungModel,
} from "../../models";

import { isFeatureAvailable } from "../../featureFlag/featureFlagService";
import { findOrCreateReferent, inviteReferent } from "../../services/cle/referent";

import {
  buildUniqueClasseId,
  buildUniqueClasseKey,
  deleteClasse,
  findClasseByUniqueKeyAndUniqueId,
  generateConvocationsByClasseId,
  getClasseById,
  updateReferent,
} from "./classeService";

import {
  findChefEtablissementInfoForClasses,
  findCohesionCentersForClasses,
  findLigneInfoForClasses,
  findPdrsForClasses,
  getYoungsGroupByClasses,
} from "./export/classeExportService";
import ClasseStateManager from "./stateManager";

const querySchema = Joi.object({
  withDetails: Joi.boolean().default(true),
  // Ajoutez d'autres paramètres si nécessaire
});

const router = express.Router();
router.post(
  "/:id/convocations",
  passport.authenticate("referent", {
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
      if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, undefined, "convocation")) {
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

router.post("/export", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    if (req.query.type === "schema-de-repartition") {
      const validation = Joi.object({ cohort: Joi.array().min(1).items(Joi.string()).required() })
        .unknown()
        .validate(req.body, { stripUnknown: true });
      if (validation.error) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      if (![ROLES.ADMIN, ROLES.REFERENT_REGION].includes(req.user.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    } else {
      if (![ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(req.user.role)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const queryParams = req.query.type === "schema-de-repartition" ? { cohort: req.body.cohort, status: { $in: [STATUS_CLASSE.OPEN, STATUS_CLASSE.CLOSED] } } : {};
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

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      // Classe
      name: Joi.string().required(),
      cohort: Joi.string().allow("").allow(null).optional(),
      estimatedSeats: Joi.number().min(1).required(),
      coloration: Joi.string()
        .valid(...CLE_COLORATION_LIST)
        .required(),
      filiere: Joi.string().valid(...CLE_FILIERE_LIST),
      grades: Joi.array().items(Joi.string().valid(...CLE_GRADE_LIST)),
      type: Joi.string()
        .valid(...TYPE_CLASSE_LIST)
        .required(),
      etablissementId: Joi.string().required(),
      // Referent
      referent: Joi.object({
        _id: Joi.string().optional(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
      }).required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canCreateClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findById(value.etablissementId);
    if (!etablissement) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Etablissement not found." });
    }

    let cohortName: string | null = null;
    const isCleClasseCohortEnabled = await isFeatureAvailable(FeatureFlagName.CLE_CLASSE_ADD_COHORT_ENABLED);
    if (value.cohort) {
      if (!isCleClasseCohortEnabled) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      const defaultCleCohort = await CohortModel.findOne({ name: value.cohort });
      if (!defaultCleCohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Cohort not found." });
      cohortName = defaultCleCohort.name;
    }

    const uniqueClasseKey = buildUniqueClasseKey(etablissement);
    const uniqueClasseId = buildUniqueClasseId(etablissement, {
      name: value.name,
      coloration: value.coloration,
      estimatedSeats: value.estimatedSeats,
    });
    const previousClasse = await findClasseByUniqueKeyAndUniqueId(uniqueClasseKey, uniqueClasseId);
    if (previousClasse) {
      return res.status(409).send({ ok: false, code: ERRORS.ALREADY_EXISTS, message: "Classe already exists." });
    }

    const referent = await findOrCreateReferent(value.referent, { etablissement, role: ROLES.REFERENT_CLASSE });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Referent not found/created." });
    if (referent === ERRORS.USER_ALREADY_REGISTERED) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

    const cohort = await CohortModel.findOne({ name: cohortName });

    const classe = await ClasseModel.create({
      ...value,
      status: STATUS_CLASSE.CREATED,
      statusPhase1: STATUS_PHASE1_CLASSE.WAITING_AFFECTATION,
      academy: etablissement.academy,
      region: etablissement.region,
      department: etablissement.department,
      cohort: cohortName,
      schoolYear: ClasseSchoolYear.YEAR_2024_2025,
      totalSeats: value.estimatedSeats,
      uniqueId: uniqueClasseId,
      uniqueKey: uniqueClasseKey,
      uniqueKeyAndId: `${uniqueClasseKey}-${uniqueClasseId}`,
      referentClasseIds: [referent._id],
      cohortId: cohort?._id,
    });

    if (!classe) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, message: "Classe not created." });

    if (!etablissement.schoolYears.includes(ClasseSchoolYear.YEAR_2024_2025)) {
      etablissement.set({ schoolYears: [...etablissement.schoolYears, ClasseSchoolYear.YEAR_2024_2025] });
      await etablissement.save();
    }

    if (!value.referent?._id) {
      // Un nouveau référent de classe a été créé
      await inviteReferent(referent, { role: ROLES.REFERENT_CLASSE, from: isAdmin(req.user) ? null : req.user }, etablissement);
    } else {
      // Un référent existant a été affecté à la classe
      emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.REFERENT_AFFECTED_TO_CLASSE, classe);
    }

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_CREATED, classe);

    return res.status(200).send({ ok: true, data: classe });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      estimatedSeats: Joi.number().required(),
      totalSeats: Joi.number().required(),
      cohort: Joi.string().optional(),
      coloration: Joi.string()
        .valid(...CLE_COLORATION_LIST)
        .required(),
      filiere: Joi.string()
        .valid(...CLE_FILIERE_LIST)
        .required(),
      grades: Joi.array()
        .items(Joi.string().valid(...CLE_GRADE_LIST))
        .required(),
      type: Joi.string()
        .valid(...TYPE_CLASSE_LIST)
        .required(),
      sessionId: Joi.string().allow(null),
      cohesionCenterId: Joi.string().allow(null),
      pointDeRassemblementId: Joi.string().allow(null),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canUpdateClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let classe = await ClasseModel.findById(value.id);
    if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (req.user.role === ROLES.REFERENT_CLASSE && !classe.referentClasseIds.includes(req.user._id))
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (req.user.role === ROLES.ADMINISTRATEUR_CLE) {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (etablissement.referentEtablissementIds.includes(req.user._id) && etablissement.coordinateurIds.includes(req.user._id)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    let youngs;
    if (classe.cohort !== value.cohort) {
      const cohort = await CohortModel.findOne({ name: value.cohort });
      if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (!canUpdateCohort(cohort as CohortDto, req.user as any)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      youngs = await YoungModel.find({ classeId: classe._id });
      // * Impossible to change cohort if a young has already completed phase1
      const youngWithStatusPhase1Done = youngs.find((y) => y.statusPhase1 === YOUNG_STATUS_PHASE1.DONE);
      if (youngWithStatusPhase1Done) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (value.estimatedSeats !== classe.estimatedSeats) {
      if (!canEditEstimatedSeats(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      if (value.estimatedSeats > classe.estimatedSeats) {
        emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_INCREASE_OBJECTIVE, classe);
      }
      const now = new Date();
      const limitDateEstimatedSeats = new Date(LIMIT_DATE_ESTIMATED_SEATS);
      if (now <= limitDateEstimatedSeats) {
        classe.set({ ...classe, estimatedSeats: value.estimatedSeats, totalSeats: value.estimatedSeats });
        value.totalSeats = value.estimatedSeats;
      }
    }

    if (value.totalSeats !== classe.totalSeats) {
      if (!canEditTotalSeats(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      if (value.totalSeats > value.estimatedSeats) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const oldCohort = classe.cohort;
    classe.set({ ...value, sessionId: classe.sessionId || null });

    if (canUpdateClasseStay(req.user)) {
      if (oldCohort !== value.cohort && classe.ligneId) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
      if (oldCohort !== value.cohort && !classe.ligneId) {
        classe.set({
          sessionId: undefined,
          cohesionCenterId: undefined,
          pointDeRassemblementId: undefined,
        });

        const cohort = await CohortModel.findOne({ name: value.cohort });

        const youngs = await YoungModel.find({ classeId: classe._id });
        await Promise.all(
          youngs.map((y) => {
            y.set({
              cohort: value.cohort,
              sessionPhase1Id: undefined,
              cohesionCenterId: undefined,
              meetingPointId: undefined,
              cohortId: cohort?._id,
            });
            return y.save({ fromUser: req.user });
          }),
        );
        emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_COHORT_UPDATED, classe);
      } else {
        classe.set({
          sessionId: value.sessionId,
          cohesionCenterId: value.cohesionCenterId,
          pointDeRassemblementId: value.pointDeRassemblementId,
        });
      }
    }

    classe = await classe.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: classe });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/referent", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    if (!canUpdateReferentClasse(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const { error, value } = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
    }).validate(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const classe = await updateReferent(req.params.id, value, req.user);
    return res.status(200).send({ ok: true, data: classe });
  } catch (error) {
    capture(error);
    res.status(422).send({ ok: false, code: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // Validate and transform query parameters
    const { error: queryError, value: queryParams } = querySchema.validate(req.query);
    if (queryError) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: queryError.message });
    }

    const data = await getClasseById(value, queryParams?.withDetails);

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    if (error.message === "Classe not found") {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/from-etablissement/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const classes: ClasseDocument<{ referent: Array<ReferentType | null> }>[] = await ClasseModel.find({ etablissementId: value })?.lean();
    if (!classes) {
      captureMessage("Error finding classe with etablissementId : " + JSON.stringify(value));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const findReferentsById = async (referentClasseIds) => {
      const uniqueReferentIds = [...new Set(referentClasseIds)];
      const referentsPromises = uniqueReferentIds.map((referentId) => {
        return ReferentModel.findById(referentId).lean();
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

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: errorId, value: id } = validateId(req.params.id);
    const { error: errorType, value: type } = Joi.string().valid("delete", "withdraw").required().validate(req.query.type);
    if (errorId) {
      capture(errorId);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (errorType) {
      capture(errorType);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (type === "withdraw" && !canWithdrawClasse(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    if (type === "delete" && !canDeleteClasse(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const classe = await ClasseModel.findById(id);
    if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (type === "delete") {
      await deleteClasse(id, req.user);
    } else if (type === "withdraw") {
      await ClasseStateManager.withdraw(id, req.user, { YoungModel });
    } else {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: error });
  }
});

router.get("/:id/notifyRef", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canNotifyAdminCleForVerif(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const classe: ClasseDocument<{ etablissement: EtablissementDocument }> | null = await ClasseModel.findById(value).populate({
      path: "etablissement",
      options: { select: { referentEtablissementIds: 1, coordinateurIds: 1, department: 1, region: 1 } },
    });

    if (!classe?.etablissement?.referentEtablissementIds) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    console.log(classe.etablissement.department);
    if (req.user.role === ROLES.REFERENT_REGION && classe.etablissement.region !== req.user.region) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    if (req.user.role === ROLES.REFERENT_DEPARTMENT && !req.user.department?.includes(classe.etablissement.department)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_NOTIFY_VERIF, classe);

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/verify", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      status: Joi.string().allow(STATUS_CLASSE.VERIFIED).required(),
      estimatedSeats: Joi.number().required(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canVerifyClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let classe = await ClasseModel.findById(value.id).populate({
      path: "referents",
      options: { select: { firstName: 1, lastName: 1, role: 1, email: 1 } },
    });
    if (!classe || !classe.referents?.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (req.user.role === ROLES.ADMINISTRATEUR_CLE) {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (!etablissement.referentEtablissementIds.includes(req.user._id) && !etablissement.coordinateurIds.includes(req.user._id)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) {
      if (!req.user.department?.includes(classe.department)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }
    if (req.user.role === ROLES.REFERENT_REGION) {
      if (classe.region !== req.user.region) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    classe.set({
      status: STATUS_CLASSE.VERIFIED,
    });

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_VERIFIED, classe, req.user);

    classe = await classe.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: classe });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
