const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../../sentry");
const { ERRORS } = require("../../../utils");
const Joi = require("joi");
const todoService = require("../../../services/dashboard/todo.service");
const { getKeyNumbers } = require("../../../services/stats.service");

router.post("/todo", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    return res.status(200).send({
      ok: true,
      data: await todoService.todosByRole(req.user),
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/key-numbers", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const schema = Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      phase: Joi.string().valid("inscription", "sejour", "engagement", "all").required(),
    });
    const { value, error } = schema.validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { startDate, endDate, phase } = value;
    const notes = await getKeyNumbers(phase, startDate, endDate, req.user);
    res.status(200).send({ ok: true, data: notes });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
