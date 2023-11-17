const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { CLE_COLORATION_LIST, CLE_TYPE_LIST, CLE_SECTOR_LIST, CLE_GRADE_LIST, ROLES, canWriteClasse } = require("snu-lib");
const mongoose = require("mongoose");
const { capture, captureMessage } = require("../../sentry");
const EtablissementModel = require("../../models/cle/etablissement");
const ClasseModel = require("../../models/cle/classe");
const CohortModel = require("../../models/cohort");
const ReferentModel = require("../../models/referent");
const { findOrCreateReferent, inviteReferent } = require("../../services/cle/referent");
const { ERRORS } = require("../../utils");
const { validateId } = require("../../utils/validator");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  let session;

  try {
    const { error, value } = Joi.object({
      // Classe
      uniqueId: Joi.string().alphanum().min(1).max(5).required(),
      cohort: Joi.string().default("CLE 23-24").required(),
      // Referent
      referent: Joi.object({
        _id: Joi.string(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string(),
      }).required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canWriteClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: req.user._id });
    if (!etablissement) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const uniqueKey = `${etablissement.uai}_${new Date().toLocaleDateString("fr-FR")}`;
    const previousClasse = await ClasseModel.findOne({ uniqueKey, uniqueId: value.uniqueId, etablissementId: etablissement._id });
    if (previousClasse) return res.status(409).send({ ok: false, code: ERRORS.ALREADY_EXISTS });

    let classe;
    // Learn more about session/transaction with mongoos here: https://mongoosejs.com/docs/transactions.html
    session = await mongoose.startSession();
    // Transaction make sure all ressources are created/updated or none will be persisted in the database
    session.withTransaction(async () => {
      const referent = await findOrCreateReferent(value.referent, { role: ROLES.REFERENT_CLASSE, session });
      if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Referent not found/created." });

      const defaultCleCohort = await CohortModel.findOne({ name: value.cohort }, { session });
      if (!defaultCleCohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Cohort not found." });

      classe = await ClasseModel.create(
        {
          ...value,
          cohort: defaultCleCohort.name,
          uniqueKey,
          uniqueId: value.uniqueId,
          referentClasseIds: [referent._id],
          etablissementId: etablissement._id,
        },
        { session },
      );

      // We send the email invitation once we are sure both the referent and the classe are created
      await inviteReferent(referent, { role: ROLES.REFERENT_CLASSE, user: req.user });
    });

    if (!classe) throw new Error("Classe not created.");

    return res.status(200).send({ ok: true, data: classe });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  } finally {
    session?.endSession();
  }
});

router.put("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      _id: Joi.string().required(),
      uniqueId: Joi.string().alphanum().min(1).max(5).required(),
      name: Joi.string().required(),
      totalSeats: Joi.number().required(),
      coloration: Joi.string().allow(CLE_COLORATION_LIST).required(),
      type: Joi.string().allow(CLE_TYPE_LIST).required(),
      sector: Joi.string().allow(CLE_SECTOR_LIST).required(),
      grade: Joi.string().allow(CLE_GRADE_LIST).required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canWriteClasse(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: req.user._id });
    if (!etablissement) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let classe = await ClasseModel.findOne({ _id: value._id, etablissementId: etablissement._id });
    if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const previousClasse = await ClasseModel.findOne({ uniqueKey: classe.uniqueKey, uniqueId: value.uniqueId, etablissementId: etablissement._id });
    if (previousClasse) return res.status(409).send({ ok: false, code: ERRORS.ALREADY_EXISTS });

    classe.set({
      uniqueId: value.uniqueId,
      name: value.name,
      totalSeats: value.totalSeats,
      coloration: value.coloration,
      type: value.type,
      sector: value.sector,
      grade: value.grade,
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

module.exports = router;
