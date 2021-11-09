const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const { validateId } = require("../utils/validator");
const MeetingPointModel = require("../models/meetingPoint");
const CohesionCenterModel = require("../models/cohesionCenter");
const BusModel = require("../models/bus");
const { ERRORS, isYoung } = require("../utils");

router.get("/all", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await MeetingPointModel.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    // A young can only see his own meetingPoint.
    if (isYoung(req.user) && checkedId !== req.user.meetingPointId) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    const data = await MeetingPointModel.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const bus = await BusModel.findById(data.busId);
    return res.status(200).send({ ok: true, data: { ...data._doc, bus } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const center = await CohesionCenterModel.findById(req.user.cohesionCenterId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    let data = [];
    if (req.user.department) data = await MeetingPointModel.find({ departureDepartment: req.user.department, centerCode: center.code });
    for (let i = 0; i < data.length; i++) {
      const bus = await BusModel.findById(data[i].busId);
      data[i] = { ...data[i]._doc, bus };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
