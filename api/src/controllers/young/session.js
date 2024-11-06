const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const { SessionPhase1Model } = require("../../models");
const { YoungModel } = require("../../models");
const { serializeSessionPhase1 } = require("../../utils/serializer");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const { validateId } = require("../../utils/validator");

router.get("/", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const young = await YoungModel.findById(id);

    const session = await SessionPhase1Model.findById(young.sessionPhase1Id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(session) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
