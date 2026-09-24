const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });

const { capture } = require("../../sentry");
const { YoungModel } = require("../../models");
const { MeetingPointModel } = require("../../models");
const { ERRORS } = require("../../utils");
const { serializeMeetingPoint } = require("../../utils/serializer");
const { validateId } = require("../../utils/validator");

router.get("/", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const data = await MeetingPointModel.findOne({ _id: young.meetingPointId, deletedAt: { $exists: false } });

    return res.status(200).send({ ok: true, data: data ? serializeMeetingPoint(data) : null });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
