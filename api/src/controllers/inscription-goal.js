const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");
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

router.get("/", async (req, res) => {
  try {
    const data = await InscriptionGoalModel.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/current", async (req, res) => {
  try {
    const y2020 = await YoungModel.find({ cohort: "2020", statusPhase1: "WAITING_AFFECTATION", department: req.body.department }).count();
    const y2021 = await YoungModel.find({ cohort: "2021", status: "VALIDATED", department: req.body.department }).count();
    const yWL = await YoungModel.find({ status: "WAITING_LIST", department: req.body.department }).count();
    const data = { registered: y2020 + y2021, waitingList: yWL };
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
