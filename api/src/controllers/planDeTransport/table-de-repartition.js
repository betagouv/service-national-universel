const express = require("express");
const router = express.Router();
const passport = require("passport");
const { region2department, canViewTableDeRepartition, canEditTableDeRepartitionDepartment, canEditTableDeRepartitionRegion } = require("snu-lib");
const { ERRORS } = require("../../utils");
const { TableDeRepartitionModel } = require("../../models");
const { capture } = require("../../sentry");
const Joi = require("joi");

router.post("/region", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      toRegion: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditTableDeRepartitionRegion(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort, fromRegion, toRegion } = value;
    const exist = await TableDeRepartitionModel.findOne(value);
    if (exist) return res.status(409).send({ ok: false, code: ERRORS.ALREADY_EXISTS });
    await TableDeRepartitionModel.create({ cohort, fromRegion, toRegion });
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/delete/region", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      toRegion: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditTableDeRepartitionRegion(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const toRemove = await TableDeRepartitionModel.find({ ...value });
    await TableDeRepartitionModel.deleteMany({ _id: { $in: toRemove.map((e) => e._id) } });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/department", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      toRegion: Joi.string().required(),
      fromDepartment: Joi.string().required(),
      toDepartment: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditTableDeRepartitionDepartment(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort, fromRegion, toRegion, fromDepartment, toDepartment } = value;

    const existing = await TableDeRepartitionModel.find({ cohort, fromRegion, toRegion });

    //si pas de fromRegion, toRegion, operation interdite
    if (existing.length === 0) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    //si on a une seul entrée et ques les deux départements sont a null, on update
    if (existing.length === 1 && !existing[0].toDepartment && !existing[0].fromDepartment) {
      await TableDeRepartitionModel.updateOne({ _id: existing[0]._id }, { $set: { fromDepartment, toDepartment } });
    } else {
      //sinon on crée une nouvelle entrée avec check des doublons
      const doublon = await TableDeRepartitionModel.findOne({ cohort, fromRegion, toRegion, fromDepartment, toDepartment });
      if (doublon) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      TableDeRepartitionModel.create({ cohort, fromRegion, toRegion, fromDepartment, toDepartment });
    }
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/delete/department", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      toRegion: Joi.string().required(),
      fromDepartment: Joi.string().required(),
      toDepartment: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditTableDeRepartitionDepartment(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort, fromRegion, toRegion, fromDepartment, toDepartment } = value;

    const toDelete = await TableDeRepartitionModel.findOne({ cohort, fromRegion, toRegion, fromDepartment, toDepartment });
    const existing = await TableDeRepartitionModel.find({ cohort, fromRegion, toRegion });

    //si rien a supprimer, on renvoie une erreur
    if (!toDelete) return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    //si on a une seul entrée dans la table, on update cette derniere
    if (existing.length === 1) {
      //check si toDelete === existing[0] pour eviter de supprimer la mauvaise donnée
      if (toDelete._id.toString() === existing[0]._id.toString()) {
        await TableDeRepartitionModel.updateOne({ _id: existing[0]._id }, { $set: { fromDepartment: undefined, toDepartment: undefined } });
      } else {
        return res.status(400).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    } else {
      //sinon on supprime l'entrée
      toDelete.remove();
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/national/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewTableDeRepartition(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort } = value;
    const data = await TableDeRepartitionModel.find({ cohort });

    const filteredData = data.filter((e, i) => {
      return i === data.findIndex((a) => a.fromRegion === e.fromRegion && a.toRegion === e.toRegion);
    });

    for (const dataToEdit of filteredData) {
      let avancement =
        (region2department[dataToEdit.fromRegion].reduce((acc, department) => {
          if (!data.find((e) => e.fromDepartment === department)) return acc;
          return (acc += 1);
        }, 0) /
          region2department[dataToEdit.fromRegion].length) *
          100 || 0;
      dataToEdit._doc.avancement = Math.trunc(avancement);
    }

    return res.status(200).send({ ok: true, data: filteredData });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/fromRegion/:cohort/:region", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      region: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewTableDeRepartition(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort, region } = value;
    const data = await TableDeRepartitionModel.find({ cohort, fromRegion: region });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/toRegion/:cohort/:region", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      region: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewTableDeRepartition(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort, region } = value;
    const data = await TableDeRepartitionModel.find({ cohort, toRegion: region });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
