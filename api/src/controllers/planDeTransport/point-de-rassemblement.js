const express = require("express");
const router = express.Router();
const passport = require("passport");
const PointDeRassemblementModel = require("../../models/pointDeRassemblement");
const YoungModel = require("../../models/young");
const { canViewMeetingPoints, canUpdateMeetingPoint, canCreateMeetingPoint, canDeleteMeetingPoint } = require("snu-lib/roles");
const { ERRORS } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");
const { validateId } = require("../../utils/validator");
const nanoid = require("nanoid");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().required(),
      complementAddress: Joi.array().items(
        Joi.object({
          cohort: Joi.string().required(),
          complement: Joi.string().required(),
        }),
      ),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      department: Joi.string().required(),
      region: Joi.string().required(),
      location: Joi.object({
        lat: Joi.number().required(),
        lon: Joi.number().required(),
      })
        .default({
          lat: undefined,
          lon: undefined,
        })
        .allow({}, null),
    }).validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canCreateMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.FORBIDDEN });

    const { cohort, name, address, complementAddress, city, zip, department, region, location } = value;

    const pointDeRassemblement = await PointDeRassemblementModel.create({
      code: nanoid(),
      cohorts: [cohort],
      name,
      address,
      complementAddress,
      city,
      zip,
      department,
      region,
      location,
    });

    return res.status(200).send({ ok: true, pointDeRassemblement });
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
      city: Joi.string().required(),
      zip: Joi.string().required(),
      department: Joi.string().required(),
      region: Joi.string().required(),
      location: Joi.object({
        lat: Joi.number().required(),
        lon: Joi.number().required(),
      })
        .default({
          lat: undefined,
          lon: undefined,
        })
        .allow({}, null),
    }).validate({ ...req.body, id: req.params.id });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canUpdateMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id, name, address, city, zip, department, region, location } = value;

    const pointDeRassemblement = await PointDeRassemblementModel.findById(id);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    pointDeRassemblement.set({ name, address, city, zip, department, region, location });
    await pointDeRassemblement.save({ fromUser: req.user });

    //si jeunes affecté à ce point de rassemblement et ce sejour --> notification

    return res.status(200).send({ ok: true, data: pointDeRassemblement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("cohort/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      cohort: Joi.string().required(),
      complementAddress: Joi.object({
        cohort: Joi.string().required(),
        complement: Joi.string().required(),
      }),
    }).validate({ ...req.body, id: req.params.id });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canUpdateMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id, cohort, complementAddress } = value;

    const pointDeRassemblement = await PointDeRassemblementModel.findById(id);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let cohortsToUpdate = pointDeRassemblement.cohorts;
    if (!cohortsToUpdate.includes(cohort)) cohortsToUpdate.push(cohort);

    let complementAddressToUpdate = pointDeRassemblement.complementAddress;

    if (complementAddress) {
      complementAddressToUpdate = complementAddressToUpdate.filter((c) => c.cohort !== cohort);
      complementAddressToUpdate.push(complementAddress);
    }

    pointDeRassemblement.set({ cohorts: cohortsToUpdate, complementAddress: complementAddressToUpdate });
    await pointDeRassemblement.save({ fromUser: req.user });

    //si jeunes affecté à ce point de rassemblement et ce sejour --> notification

    return res.status(200).send({ ok: true, data: pointDeRassemblement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);

    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewMeetingPoints(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await PointDeRassemblementModel.findOne({ _id: checkedId, deletedAt: { $exists: false } });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canDeleteMeetingPoint(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const pointDeRassemblement = await PointDeRassemblementModel.findById(checkedId);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const youngs = await YoungModel.find({ meetingPointId: checkedId });
    if (youngs.length > 0) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const now = new Date();
    pointDeRassemblement.set({ deletedAt: now });
    await pointDeRassemblement.save({ fromUser: req.user });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
