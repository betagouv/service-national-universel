const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const Joi = require("joi");
const BusModel = require("../models/bus");
const { ERRORS } = require("../utils");
const { serializeBus } = require("../utils/serializer");

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const data = await BusModel.findById(value.id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeBus(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
