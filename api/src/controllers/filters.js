/**
 * ROUTES:
 *  POST    /filters               => create a new filter
 *  GET    /filters/:page          => get all filters for the given page
 */

const express = require("express");
const router = express.Router();
const { ERRORS } = require("../utils");
const { capture } = require("../sentry");
const Joi = require("joi");
const passport = require("passport");

const { FiltersModel } = require("../models");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      page: Joi.string().required(),
      url: Joi.string().required(),
      name: Joi.string().required(),
    }).validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { page, url, name } = value;

    //check if filter already exists
    const filter = await FiltersModel.findOne({ page, name, userId: req.user._id });
    if (filter) return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });

    const newFilter = await FiltersModel.create({ page, url, userId: req.user._id, name });

    return res.status(200).send({ ok: true, data: newFilter });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:page", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      page: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { page } = value;

    const filters = await FiltersModel.find({ page, userId: req.user._id });

    return res.status(200).send({ ok: true, data: filters });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { id } = value;

    const filter = await FiltersModel.findById(id);
    if (!filter) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (filter.userId.toString() !== req.user._id.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    await filter.remove();

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
