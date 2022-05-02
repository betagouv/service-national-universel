const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { canViewBus } = require("snu-lib/roles");
const { capture } = require("../sentry");
const BusModel = require("../models/bus");
const { ERRORS } = require("../utils");
const { serializeBus } = require("../utils/serializer");

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await BusModel.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeBus(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
