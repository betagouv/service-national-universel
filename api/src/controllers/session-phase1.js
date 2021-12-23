const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const SessionPhase1Model = require("../models/sessionPhase1");
const { ERRORS, updatePlacesSessionPhase1 } = require("../utils");
const { ROLES, canCreateOrUpdateSessionPhase1 } = require("snu-lib/roles");
const { serializeSessionPhase1 } = require("../utils/serializer");
const { validateSessionPhase1 } = require("../utils/validator");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateSessionPhase1(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (!canCreateOrUpdateSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await SessionPhase1Model.create(value);
    return res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const data = await SessionPhase1Model.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await SessionPhase1Model.find({});
    return res.status(200).send({ ok: true, data: data.map(serializeSessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateSessionPhase1({ ...req.body, ...req.params });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (!canCreateOrUpdateSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const sessionPhase1 = await SessionPhase1Model.findById(value.id);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    sessionPhase1.set(value);
    await sessionPhase1.save();

    const data = await updatePlacesSessionPhase1(sessionPhase1);
    res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (!canCreateOrUpdateSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const sessionPhase1 = await SessionPhase1Model.findById(id);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await sessionPhase1.remove();

    console.log(`sessionPhase1 ${id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
