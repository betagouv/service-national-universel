const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const {
  CLE_COLORATION_LIST,
  CLE_FILIERE_LIST,
  CLE_GRADE_LIST,
  ROLES,
  STATUS_CLASSE,
  STATUS_PHASE1_CLASSE,
  YOUNG_STATUS_PHASE1,
  SENDINBLUE_TEMPLATES,
  canCreateClasse,
  canUpdateClasse,
  canUpdateClasseStay,
  canViewClasse,
  canWithdrawClasse,
  canDeleteClasse,
} = require("snu-lib");
const { validateId } = require("../../utils/validator");
const { ERRORS } = require("../../utils");
const { capture, captureMessage } = require("../../sentry");
const EtablissementModel = require("../../models/cle/etablissement");
const ClasseModel = require("../../models/cle/classe");
const CohortModel = require("../../models/cohort");
const ReferentModel = require("../../models/referent");
const YoungModel = require("../../models/young");
const { findOrCreateReferent, inviteReferent } = require("../../services/cle/referent");
const StateManager = require("../../states");
const emailsEmitter = require("../../emails");
const { deleteClasse } = require("../../classe/classe.service");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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

router.get("/from-etablissement/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
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
