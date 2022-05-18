const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { canViewBus, canUpdateBus } = require("snu-lib/roles");
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

router.put("/:id/capacity", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  const { error, value } = Joi.object({
    id: Joi.string().required(),
    capacity: Joi.number().required(),
  }).validate({ ...req.params, ...req.body });

  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  if (!canUpdateBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

  const bus = await BusModel.findById(value.id);
  if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const placesLeft = bus.placesLeft + value.capacity - bus.capacity;
  if (placesLeft < 0) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

  bus.set({ capacity: value.capacity, placesLeft });
  await bus.save({ fromUser: req.user });
  return res.status(200).send({ ok: true, data: serializeBus(bus) });
});

module.exports = router;
