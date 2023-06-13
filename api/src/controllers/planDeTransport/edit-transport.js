const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const Joi = require("joi");
const { canViewLigneBus } = require("snu-lib");

const PlanTransportModel = require("../../models/PlanDeTransport/planTransport");
const YoungModel = require("../../models/young");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");

const { ERRORS } = require("../../utils");

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (req.user.role !== "admin" || req.user.subRole !== "god") return res.status(401).send({ ok: false, code: UNAUTHORIZED });
    const body = req.body;
    const { id } = req.params;
    let ligne = await PlanTransportModel.findOne({ _id: id });
    if (!ligne) return res.status(404).send({ ok: false, code: "NOT_FOUND" });
    const index = ligne.pointDeRassemblements.findIndex((e) => e.meetingPointId === body.meetingPointId);
    if (index < 0) return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    Object.keys(body).forEach((e) => {
      if (ligne.pointDeRassemblements[index][e]) ligne.pointDeRassemblements[index][e] = body[e];
    });
    await ligne.save();
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/youngs", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (req.user.role !== "admin" || req.user.subRole !== "god") return res.status(401).send({ ok: false, code: UNAUTHORIZED });
    const { ligneIds, cohort } = req.body;
    const youngs = await YoungModel.find({ ligneId: { $in: [...ligneIds] } }, "_id firstName lastName ligneId meetingPointId cohort");
    return res.status(200).send({ ok: true, data: youngs.filter((e) => e.cohort === cohort) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
