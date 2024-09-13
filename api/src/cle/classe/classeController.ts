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
  ClassesRoutes,
  CohortDto,
  FeatureFlagName,
  isAdmin,
  LIMIT_DATE_ESTIMATED_SEATS,
  ROLES,
  SENDINBLUE_TEMPLATES,
  STATUS_CLASSE,
  STATUS_PHASE1_CLASSE,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  ClasseCertificateKeys,
} from "snu-lib";

import { capture, captureMessage } from "../../sentry";
import { ERRORS, isReferent } from "../../utils";
import { validateId } from "../../utils/validator";
import emailsEmitter from "../../emails";
import { RouteRequest, RouteResponse, UserRequest } from "../../controllers/request";
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

import { ClassesRoutesSchema } from "./classeValidator";
import {
  buildUniqueClasseId,
  buildUniqueClasseKey,
  canUpdateReferentClasseBasedOnStatus,
  deleteClasse,
  findClasseByUniqueKeyAndUniqueId,
  generateCertificateByKey,
  getClasseById,
  getClasseByIdPublic,
  updateReferentByClasseId,
  UpdateReferentClasse,
} from "./classeService";

import {
  findChefEtablissementInfoForClasses,
  findCohesionCentersForClasses,
  findLigneInfoForClasses,
  findPdrsForClasses,
  getYoungsGroupByClasses,
} from "./export/classeExportService";
import ClasseStateManager from "./stateManager";

const router = express.Router();
router.post(
  "/:id/certificate/:key",
  passport.authenticate("referent", {
    session: false,
    failWithError: true,
  }),
  async (req: UserRequest, res: Response) => {
    try {
      const certificateValues = Object.values(ClasseCertificateKeys);
      const { error: exportDateKeyError, value: certificateKey } = Joi.string()
        .valid(...certificateValues)
        .required()
        .validate(req.params.key, { stripUnknown: true });

      const { error: idError, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });

      if (exportDateKeyError) {
        capture(exportDateKeyError);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      if (idError) {
        capture(idError);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      if (isReferent(req.user) && !canDownloadYoungDocuments(req.user, undefined, "certificate")) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      const classe = await ClasseModel.findById(id);
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const certificates = await generateCertificateByKey(certificateKey, id);

      res.set({
        "content-length": certificates.length,
        "content-disposition": `inline; filename="convocations.pdf"`,
        "content-type": "application/pdf",
        "cache-control": "public, max-age=1",
      });
      res.send(certificates);
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

router.post(
  "/",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req: RouteRequest<ClassesRoutes["Create"]>, res: RouteResponse<ClassesRoutes["Create"]>) => {
    try {
      const { error, value: payload } = ClassesRoutesSchema.Create.payload.validate(req.body, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      if (!canCreateClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const etablissement = await EtablissementModel.findById(payload.etablissementId);
      if (!etablissement) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Etablissement not found." });
      }

      let cohortName: string | null = null;
      let cohortId: string | null = null;
      const isCleClasseCohortEnabled = await isFeatureAvailable(FeatureFlagName.CLE_CLASSE_ADD_COHORT_ENABLED);
      if (payload.cohortId) {
        if (!isCleClasseCohortEnabled) {
          return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
        }
        const defaultCleCohort = await CohortModel.findById({ _id: payload.cohortId });
        if (!defaultCleCohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Cohort not found." });
        cohortName = defaultCleCohort.name;
        cohortId = defaultCleCohort._id;
      }

      const uniqueClasseKey = buildUniqueClasseKey(etablissement);
      const uniqueClasseId = buildUniqueClasseId(etablissement, {
        name: payload.name,
        coloration: payload.coloration,
        estimatedSeats: payload.estimatedSeats,
      });
      const previousClasse = await findClasseByUniqueKeyAndUniqueId(uniqueClasseKey, uniqueClasseId);
      if (previousClasse) {
        return res.status(409).send({ ok: false, code: ERRORS.ALREADY_EXISTS, message: "Classe already exists." });
      }

      const referent = await findOrCreateReferent(payload.referent, { etablissement, role: ROLES.REFERENT_CLASSE });
      if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Referent not found/created." });
      if (referent === ERRORS.USER_ALREADY_REGISTERED) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

      const classeStatus = isCleClasseCohortEnabled ? STATUS_CLASSE.ASSIGNED : STATUS_CLASSE.CREATED;

      const classe = await ClasseModel.create({
        ...payload,
        status: classeStatus,
        statusPhase1: STATUS_PHASE1_CLASSE.WAITING_AFFECTATION,
        academy: etablissement.academy,
        region: etablissement.region,
        department: etablissement.department,
        cohort: cohortName,
        schoolYear: ClasseSchoolYear.YEAR_2024_2025,
        totalSeats: payload.estimatedSeats,
        uniqueId: uniqueClasseId,
        uniqueKey: uniqueClasseKey,
        uniqueKeyAndId: `${uniqueClasseKey}-${uniqueClasseId}`,
        referentClasseIds: [referent._id],
        cohortId: cohortId,
      });

      if (!classe) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, message: "Classe not created." });

      if (!etablissement.schoolYears.includes(ClasseSchoolYear.YEAR_2024_2025)) {
        etablissement.set({ schoolYears: [...etablissement.schoolYears, ClasseSchoolYear.YEAR_2024_2025] });
        await etablissement.save();
      }

      if (!payload.referent?._id) {
        // Un nouveau référent de classe a été créé
        await inviteReferent(referent, { role: ROLES.REFERENT_CLASSE, from: isAdmin(req.user) ? null : req.user }, etablissement);
      } else {
        // Un référent existant a été affecté à la classe
        emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.REFERENT_AFFECTED_TO_CLASSE, classe);
      }

      emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_CREATED, classe);

      return res.status(200).json({ ok: true, data: classe.toJSON() });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.put(
  "/:id",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req: RouteRequest<ClassesRoutes["Update"]>, res: RouteResponse<ClassesRoutes["Update"]>) => {
    try {
      const { error: errorId, value: id } = validateId(req.params.id);
      const { error, value: payload } = ClassesRoutesSchema.Update.payload.validate(req.body, { stripUnknown: true });
      if (errorId || error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      if (!canUpdateClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      let classe = await ClasseModel.findById(id);
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

      if (classe.cohortId !== payload.cohortId) {
        const cohort = await CohortModel.findById({ _id: payload.cohortId });
        if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        if (!canUpdateCohort(cohort as CohortDto, req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        const youngs = await YoungModel.find({ classeId: classe._id });
        // * Impossible to change cohort if a young has already completed phase1
        const youngWithStatusPhase1Done = youngs.find((y) => y.statusPhase1 === YOUNG_STATUS_PHASE1.DONE);
        if (youngWithStatusPhase1Done) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      if (payload.estimatedSeats !== classe.estimatedSeats) {
        if (!canEditEstimatedSeats(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        if (payload.estimatedSeats > classe.estimatedSeats) {
          emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_INCREASE_OBJECTIVE, classe);
        }
        const now = new Date();
        const limitDateEstimatedSeats = new Date(LIMIT_DATE_ESTIMATED_SEATS);
        if (now <= limitDateEstimatedSeats) {
          classe.set({ ...classe, estimatedSeats: payload.estimatedSeats, totalSeats: payload.estimatedSeats });
          payload.totalSeats = payload.estimatedSeats;
        }
      }

      if (payload.totalSeats !== classe.totalSeats) {
        if (!canEditTotalSeats(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        if (payload.totalSeats > payload.estimatedSeats) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const oldCohortId = classe.cohortId;
      classe.set({ ...payload, sessionId: classe.sessionId || null });

      if (canUpdateClasseStay(req.user)) {
        if (oldCohortId !== payload.cohortId && classe.ligneId) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        }
        if (oldCohortId !== payload.cohortId && !classe.ligneId) {
          const cohort = await CohortModel.findById({ name: payload.cohortId });

          const youngs = await YoungModel.find({ classeId: classe._id });
          await Promise.all(
            youngs.map((y) => {
              y.set({
                sessionPhase1Id: undefined,
                cohesionCenterId: undefined,
                meetingPointId: undefined,
                cohort: cohort?.name,
                cohortId: cohort?._id,
              });
              return y.save({ fromUser: req.user });
            }),
          );
          classe.set({
            sessionId: undefined,
            cohesionCenterId: undefined,
            pointDeRassemblementId: undefined,
            cohortId: cohort?._id,
            status: STATUS_CLASSE.ASSIGNED,
          });
          emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_COHORT_UPDATED, classe);
        } else {
          classe.set({
            sessionId: payload.sessionId,
            cohesionCenterId: payload.cohesionCenterId,
            pointDeRassemblementId: payload.pointDeRassemblementId,
          });
        }
      }

      classe = await classe.save({ fromUser: req.user });

      return res.status(200).json({ ok: true, data: classe.toJSON() });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.put("/:id/referent", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    if (!canUpdateReferentClasse(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const { error, value } = Joi.object<UpdateReferentClasse & { id: string }>({
      id: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
    }).validate({ id: req.params.id, ...req.body });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { id, ...referent } = value;

    await canUpdateReferentClasseBasedOnStatus(req.user, id);

    const classe = await updateReferentByClasseId(id, referent, req.user);
    return res.status(200).send({ ok: true, data: classe });
  } catch (error) {
    capture(error);
    res.status(422).send({ ok: false, code: error.message });
  }
});

router.get(
  "/:id",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req: RouteRequest<ClassesRoutes["GetOne"]>, res: RouteResponse<ClassesRoutes["GetOne"]>) => {
    try {
      const { error, value: id } = validateId(req.params.id);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      if (!canUpdateClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      // Validate and transform query parameters
      const { error: queryError, value: queryParams } = ClassesRoutesSchema.GetOne.query.validate(req.query);
      if (queryError) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: queryError.message });
      }

      const data = await getClasseById(id, queryParams?.withDetails);

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

router.delete(
  "/:id",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req: RouteRequest<ClassesRoutes["Delete"]>, res: RouteResponse<ClassesRoutes["Delete"]>) => {
    try {
      const { error: errorId, value: id } = validateId(req.params.id);
      const { error: errorType, value: queryParams } = ClassesRoutesSchema.Delete.query.validate(req.query);
      if (errorId) {
        capture(errorId);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      if (errorType) {
        capture(errorType);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      if (queryParams.type === "withdraw" && !canWithdrawClasse(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
      if (queryParams.type === "delete" && !canDeleteClasse(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const classe = await ClasseModel.findById(id);
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (queryParams.type === "delete") {
        await deleteClasse(id, req.user);
      } else if (queryParams.type === "withdraw") {
        await ClasseStateManager.withdraw(id, req.user, { YoungModel });
      } else {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: error });
    }
  },
);

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
