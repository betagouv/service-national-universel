const express = require("express");
const router = express.Router();
const passport = require("passport");
const { canViewBus } = require("snu-lib");
const { capture } = require("../sentry");
const { BusModel, MeetingPointModel, CohesionCenterModel } = require("../models");
const { ERRORS } = require("../utils");
const { serializeBus, serializeCohesionCenter } = require("../utils/serializer");
const { validateId } = require("../utils/validator");

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await BusModel.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeBus(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.get("/:id/cohesion-center", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const meetingPoints = await MeetingPointModel.find({ busId: id });
    const cohesionCenters = await CohesionCenterModel.find({ _id: { $in: meetingPoints.map((mp) => mp.centerId) } });

    return res.status(200).send({ ok: true, data: cohesionCenters.map(serializeCohesionCenter) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
