const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const sessionPhase1Model = require("../../Databases/Mongo/Models/sessionPhase1");
const YoungModel = require("../../Databases/Mongo/Models/young");
const { serializeSessionPhase1 } = require("../../../Application/Utils/serializer");
const { capture } = require("../../Services/sentry");
const { ERRORS } = require("../../../Application/Utils");
const { validateId } = require("../../../Application/Utils/validator");

router.get("/", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const young = await YoungModel.findById(id);

    const session = await sessionPhase1Model.findById(young.sessionPhase1Id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(session) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
