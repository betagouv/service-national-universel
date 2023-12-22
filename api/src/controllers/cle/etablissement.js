const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");
const { CLE_TYPE_LIST, CLE_SECTOR_LIST, SUB_ROLES, ROLES, canUpdateEtablissement, canViewEtablissement, isAdmin } = require("snu-lib");

const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { validateId } = require("../../utils/validator");
const EtablissementModel = require("../../models/cle/etablissement");
const ClasseModel = require("../../models/cle/classe");
const ReferentModel = require("../../models/referent");

router.get("/from-user", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canViewEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const searchField = req.user.role === ROLES.REFERENT_CLASSE ? "_id" : req.user.subRole === SUB_ROLES.referent_etablissement ? "referentEtablissementIds" : "coordinateurIds";
    const query = {};
    let valueField = { $in: [req.user._id] };
    if (req.user.role === ROLES.REFERENT_CLASSE) {
      const classe = await ClasseModel.findOne({ referentClasseIds: { $in: req.user._id } });
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      valueField = classe.etablissementId;
    }
    query[searchField] = valueField;
    const etablissement = await EtablissementModel.findOne(query)?.lean();
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const coordinateurs = await ReferentModel.find({ _id: { $in: etablissement.coordinateurIds } }).lean();
    etablissement.coordinateurs = coordinateurs.map((c) => ({
      _id: c._id,
      firstName: c.firstName,
      lastName: c.lastName,
      role: c.role,
      email: c.email,
      phone: c.phone,
    }));

    return res.status(200).send({ ok: true, data: etablissement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findById(id);
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: etablissement });
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
      address: Joi.string().required(),
      zip: Joi.string().required(),
      city: Joi.string().required(),
      department: Joi.string().required(),
      region: Joi.string().required(),
      type: Joi.array()
        .items(Joi.string().valid(...CLE_TYPE_LIST))
        .required(),
      sector: Joi.array()
        .items(Joi.string().valid(...CLE_SECTOR_LIST))
        .required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canUpdateEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findById(value.id);
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    etablissement.set({
      ...value,
    });
    await etablissement.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: etablissement });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/referents", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      referentEtablissementIds: Joi.array().items(Joi.string()).required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!isAdmin(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findById(value.id);
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    etablissement.set({
      referentEtablissementIds: value.referentEtablissementIds,
    });
    await etablissement.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: etablissement });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
