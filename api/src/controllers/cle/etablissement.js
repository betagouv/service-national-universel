const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");
const { CLE_TYPE_LIST, CLE_SECTOR_LIST, SUB_ROLES, canUpdateEtablissement, canViewEtablissement } = require("snu-lib");

const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { validateId } = require("../../utils/validator");
const EtablissementModel = require("../../models/cle/etablissement");

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canViewEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const searchField = req.user.subRole === SUB_ROLES.referent_etablissement ? "referentEtablissementIds" : "coordinateurIds";
    const query = {};
    query[searchField] = { $in: [req.user._id] };
    const etablissement = await EtablissementModel.findOne(query);
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
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

router.put("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      type: Joi.array()
        .items(Joi.string().valid(...CLE_TYPE_LIST))
        .required(),
      sector: Joi.array()
        .items(Joi.string().valid(...CLE_SECTOR_LIST))
        .required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canUpdateEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: { $in: [req.user._id] } });
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

module.exports = router;
