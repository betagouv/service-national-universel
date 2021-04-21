const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const InscriptionGoalModel = require("../models/inscriptionGoal");
const { ERRORS } = require("../utils");

router.post("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const promises = req.body.map((item) => {
      return InscriptionGoalModel.findOneAndUpdate({ department: item.department }, item, { new: true, upsert: true, useFindAndModify: false });
    });
    await Promise.all(promises);
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    let data = [];
    if (req.user.role === "admin") data = await InscriptionGoalModel.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/departement/:d", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    let data = [];
    if (req.user.role === "admin") data = await InscriptionGoalModel.findOne({ department: req.params.d });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/region/:r", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    let data = [];
    if (req.user.role === "admin") data = await InscriptionGoalModel.findOne({ region: req.params.r });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
