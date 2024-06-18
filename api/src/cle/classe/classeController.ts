import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";

import {
  ROLES,
  canDownloadYoungDocuments,
  YOUNG_STATUS,
  STATUS_CLASSE,
  canCreateClasse,
  STATUS_PHASE1_CLASSE,
  SENDINBLUE_TEMPLATES,
  CLE_COLORATION_LIST,
  CLE_FILIERE_LIST,
  CLE_GRADE_LIST,
  canUpdateClasse,
  YOUNG_STATUS_PHASE1,
  canUpdateClasseStay,
  canViewClasse,
  canWithdrawClasse,
  canDeleteClasse,
} from "snu-lib/index";

import { capture, captureMessage } from "../../sentry";
import { ERRORS, isReferent } from "../../utils";
import { CleClasseModel } from "../../models";

import { UserRequest } from "../../controllers/request";

import { deleteClasse, generateConvocationsByClasseId } from "./classeService";
import { findCohesionCentersForClasses, findPdrsForClasses, getYoungsGroupByClasses, findLigneInfoForClasses, findReferentInfoForClasses } from "./export/classeExportService";
import ClasseModel from "../../models/cle/classe";
import { findOrCreateReferent, inviteReferent } from "../../services/cle/referent";
import CohortModel from "../../models/cohort";
import emailsEmitter from "../../emails";
import EtablissementModel from "../../models/cle/etablissement";
import YoungModel from "../../models/young";
import StateManager from "../../states";
import { validateId } from "../../utils/validator";
import ReferentModel from "../../models/referent";

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
      // @ts-ignore
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

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      // Classe
      uniqueKey: Joi.string().required(),
      uniqueId: Joi.string().alphanum().min(0).max(15).allow("").required(),
      cohort: Joi.string().default("CLE 23-24").required(),
      etablissementId: Joi.string().required(),
      // Referent
      referent: Joi.object({
        _id: Joi.string().optional(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string(),
      }).required(),
      etablissement: Joi.object({
        name: Joi.string(),
        department: Joi.string(),
        region: Joi.string(),
      }).required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canCreateClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const previousClasse = await ClasseModel.findOne({ uniqueKey: value.uniqueKey, uniqueId: value.uniqueId, etablissementId: value.etablissementId });
    if (previousClasse) return res.status(409).send({ ok: false, code: ERRORS.ALREADY_EXISTS });

    // @ts-ignore
    const referent = await findOrCreateReferent(value.referent, { etablissement: value.etablissement, role: ROLES.REFERENT_CLASSE });
    if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Referent not found/created." });
    if (referent === ERRORS.USER_ALREADY_REGISTERED) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

    const defaultCleCohort = await CohortModel.findOne({ name: value.cohort });
    if (!defaultCleCohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Cohort not found." });

    const classe = await ClasseModel.create({
      ...value,
      status: STATUS_CLASSE.DRAFT,
      statusPhase1: STATUS_PHASE1_CLASSE.WAITING_AFFECTATION,
      cohort: defaultCleCohort.name,
      uniqueKeyAndId: value.uniqueKey + "_" + value.uniqueId,
      referentClasseIds: [referent._id],
    });

    if (!classe) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, message: "Classe not created." });

    if (!value.referent?._id) {
      await inviteReferent(referent, { role: ROLES.REFERENT_CLASSE, user: req.user }, value.etablissement);
    } else {
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
      totalSeats: Joi.number().required(),
      cohort: Joi.string().required(),
      coloration: Joi.string()
        .valid(...CLE_COLORATION_LIST)
        .required(),
      filiere: Joi.string()
        .valid(...CLE_FILIERE_LIST)
        .required(),
      grade: Joi.string()
        .valid(...CLE_GRADE_LIST)
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
      youngs = await YoungModel.find({ classeId: classe._id });
      // * Impossible to change cohort if a young has already completed phase1
      const youngWithStatusPhase1Done = youngs.find((y) => y.statusPhase1 === YOUNG_STATUS_PHASE1.DONE);
      if (youngWithStatusPhase1Done) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
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

        const youngs = await YoungModel.find({ classeId: classe._id });
        await Promise.all(
          youngs.map((y) => {
            y.set({
              cohort: value.cohort,
              sessionPhase1Id: undefined,
              cohesionCenterId: undefined,
              meetingPointId: undefined,
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
    classe = await StateManager.Classe.compute(classe._id, req.user, { YoungModel });

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_INFOS_COMPLETED, classe);

    return res.status(200).send({ ok: true, data: classe });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // We need to populate the model with the 2 virtuals etablissement and referents
    const data = await ClasseModel.findById(value)
      .populate({ path: "etablissement", options: { select: { referentEtablissementIds: 0, coordinateurIds: 0, createdAt: 0, updatedAt: 0 } } })
      .populate({ path: "referents", options: { select: { firstName: 1, lastName: 1, role: 1, email: 1 } } })
      .populate({ path: "cohesionCenter", options: { select: { name: 1, address: 1, zip: 1, city: 1, department: 1, region: 1 } } })
      .populate({ path: "session", options: { select: { _id: 1 } } })
      .populate({ path: "pointDeRassemblement", options: { select: { name: 1, address: 1, zip: 1, city: 1, department: 1, region: 1 } } });
    if (!data) {
      captureMessage("Error finding classe with id : " + JSON.stringify(value));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
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

    const classes = await ClasseModel.find({ etablissementId: value })?.lean();
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
      await StateManager.Classe.withdraw(id, req.user, { YoungModel });
    } else {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: error });
  }
});

module.exports = router;
