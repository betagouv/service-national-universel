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
  YOUNG_STATUS,
  canCreateClasse,
  canUpdateClasse,
  canViewClasse,
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

    classe = await ClasseModel.create({
      ...value,
      status: STATUS_CLASSE.DRAFT,
      statusPhase1: STATUS_PHASE1_CLASSE.WAITING_AFFECTATION,
      cohort: defaultCleCohort.name,
      uniqueKeyAndId: value.uniqueKey + "_" + value.uniqueId,
      referentClasseIds: [referent._id],
    });

    await inviteReferent(referent, { role: ROLES.REFERENT_CLASSE, user: req.user }, value.etablissement);

    if (!classe) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, message: "Classe not created." });

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
      coloration: Joi.string()
        .valid(...CLE_COLORATION_LIST)
        .required(),
      filiere: Joi.string()
        .valid(...CLE_FILIERE_LIST)
        .required(),
      grade: Joi.string()
        .valid(...CLE_GRADE_LIST)
        .required(),
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

    const getStatus = async (classe) => {
      const students = await YoungModel.find({ classeId: classe._id })?.lean();
      const studentInProgress = students.filter((student) => student.status === YOUNG_STATUS.IN_PROGRESS || student.status === YOUNG_STATUS.WAITING_CORRECTION);
      const studentWaiting = students.filter((student) => student.status === YOUNG_STATUS.WAITING_VALIDATION);
      const studentValidated = students.filter((student) => student.status === YOUNG_STATUS.VALIDATED);

      let status = STATUS_CLASSE.INSCRIPTION_IN_PROGRESS;
      if (studentInProgress.length === 0 && studentWaiting.length > 0) status = STATUS_CLASSE.INSCRIPTION_TO_CHECK;
      if (studentValidated.length === classe.totalSeats) status = STATUS_CLASSE.VALIDATED;
      return status;
    };

    const status = classe.seatsTaken === 0 ? STATUS_CLASSE.CREATED : await getStatus(classe);
    // TODO : A modifier avec une fonction qui retourne le status en fonction du statut des jeunes

    classe.set({
      ...value,
      status: status,
    });
    classe = await classe.save({ fromUser: req.user });

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

    const classe = await ClasseModel.findById(value)?.lean();
    if (!classe) {
      captureMessage("Error finding classe with id : " + JSON.stringify(value));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const { etablissementId, referentClasseIds } = classe;
    const etablissement = etablissementId ? await EtablissementModel.findById(etablissementId)?.lean() : {};
    const referentClasse = referentClasseIds.length ? await ReferentModel.findById(referentClasseIds[0])?.lean() : {};

    return res.status(200).send({ ok: true, data: { ...classe, etablissement, referentClasse } });
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
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canDeleteClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const classe = await ClasseModel.findById(id);
    if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    classe.set({ status: STATUS_CLASSE.WITHDRAWN });
    await classe.save({ fromUser: req.user });

    const students = await YoungModel.find({ classeId: classe._id })?.lean();

    const updateStatusStudent = async (youngId, user) => {
      const young = await YoungModel.findById(youngId);
      if (!young) return;
      young.set({ status: YOUNG_STATUS.ABANDONED });
      await young.save({ fromUser: user });
    };
    await Promise.all(students.map((student) => updateStatusStudent(student._id, req.user)));
    //TODO : A modifier ? (voir avec la fonction getStatus)

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
