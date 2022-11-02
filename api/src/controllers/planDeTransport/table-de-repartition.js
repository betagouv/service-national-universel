const express = require("express");
const router = express.Router();
const passport = require("passport");
const { canViewPlanDeRepartition, canEditPlanDeRepartition } = require("snu-lib/roles");
const { regionList } = require("snu-lib");
const { ERRORS } = require("../../utils");
const tableDeRepartition = require("../../models/tableDeRepartition");
const { capture } = require("../../sentry");
const Joi = require("joi");

router.get("/all/:cohort/:fromRegion", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    console.log(req.params);
    const { error, value } = Joi.object({ cohort: Joi.string().required(), fromRegion: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewPlanDeRepartition(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await tableDeRepartition.find({ ...value });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      fromRegion: Joi.string().required(),
      ...regionList.reduce((prev, region) => ({ ...prev, [region]: Joi.array().items(Joi.string().allow(null, "")) }), {}),
    }).validate(req.body, { stripUnknown: true });
    console.log(error);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canEditPlanDeRepartition(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const cohort = value.cohort;
    const fromRegion = value.fromRegion;
    delete value.fromRegion;
    delete value.cohort;

    const toRemove = await tableDeRepartition.find({ cohort, fromRegion });
    await tableDeRepartition.deleteMany({ _id: { $in: toRemove.map((e) => e._id) } });

    for (const [region, departements] of Object.entries(value)) {
      if (departements.length === 0) {
        await tableDeRepartition.create({ cohort, fromRegion, toRegion: region });
      } else {
        const toAdd = departements.map((departement) => ({ cohort, fromRegion, toRegion: region, toDepartment: departement }));
        console.log(toAdd);
        await tableDeRepartition.insertMany(toAdd);
      }
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
