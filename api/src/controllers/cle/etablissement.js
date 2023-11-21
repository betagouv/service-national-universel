const express = require("express");
const passport = require("passport");
const router = express.Router();
const Joi = require("joi");
const { CLE_TYPE_LIST, CLE_SECTOR_LIST, canUpdateEtablissement } = require("snu-lib");

const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const EtablissementModel = require("../../models/cle/etablissement");

router.put("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      zip: Joi.string().required(),
      city: Joi.string().required(),
      department: Joi.string().required(),
      region: Joi.string().required(),
      type: Joi.string().allow(CLE_TYPE_LIST).required(),
      sector: Joi.string().allow(CLE_SECTOR_LIST).required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canUpdateEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: req.user._id });
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

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  let session;
  try {
    const { error, value } = Joi.object({
      schoolId: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canUpdateEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    session = await mongoose.startSession();
    session.withTransaction(async () => {
      const referent = await ReferentModel.findOne({ invitationToken: value.invitationToken });
      if (!referent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const ramsesSchool = await SchoolRamsesModel.findById(value.schoolId);

      const data = await EtablissementModel.create({
        schoolId: value.schoolId,
        uai: ramsesSchool.uai,
        name: ramsesSchool.name,
        referentEtablissementIds: [referent._id.toString()],
        department: ramsesSchool.department,
        region: ramsesSchool.region,
        zip: ramsesSchool.zip,
        city: ramsesSchool.city,
        address: ramsesSchool.address,

        //todo : add type, sector,
      });
      return res.status(200).send({ ok: true, data });
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  } finally {
    session?.endSession();
  }
});

module.exports = router;
