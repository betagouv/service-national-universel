const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const Joi = require("joi");
const { canViewLigneBus } = require("snu-lib");
const PlanTransportModel = require("../../models/PlanDeTransport/planTransport");
const YoungModel = require("../../models/young");

const { ERRORS, updateSeatsTakenInBusLine } = require("../../utils");

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  //todo lignetopoint a mettre a jour
  try {
    if (req.user.role !== "admin" || req.user.subRole !== "god") return res.status(401).send({ ok: false, code: ERRORS.UNAUTHORIZED });
    const body = req.body;
    const { id } = req.params;
    let ligne = await PlanTransportModel.findOne({ _id: id });
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
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
    if (req.user.role !== "admin" || req.user.subRole !== "god") return res.status(401).send({ ok: false, code: ERRORS.UNAUTHORIZED });
    const { ligneIds, cohort } = req.body;
    const youngs = await YoungModel.find({ ligneId: { $in: [...ligneIds] } }, "_id firstName lastName ligneId meetingPointId cohort");
    return res.status(200).send({ ok: true, data: youngs.filter((e) => e.cohort === cohort) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// todo : put it in the correct controller
router.get("/meetingPoints/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (req.user.role !== "admin" || req.user.subRole !== "god") return res.status(401).send({ ok: false, code: ERRORS.UNAUTHORIZED });
    const { meetingPointId, ligneId } = req.query;
    let ligne = await PlanTransportModel.findOne({ _id: ligneId });
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const index = ligne.pointDeRassemblements.findIndex((e) => e.meetingPointId === meetingPointId);
    if (index < 0) return res.status(404).send({ ok: false, code: ERRORS.INVALID_BODY });
    return res.status(200).send({ ok: true, data: ligne.pointDeRassemblements[index] });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/saveYoungs", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (req.user.role !== "admin" || req.user.subRole !== "god") return res.status(401).send({ ok: false, code: ERRORS.UNAUTHORIZED });
    const youngs = req.body.data;
    const busFrom = req.body.busFrom;
    const busTo = req.body.busTo;
    const ids = youngs.map((e) => e._id);
    const youngsDb = await YoungModel.find({ _id: { $in: [...ids] } });
    const promise = youngs.map(async (e) => {
      const index = youngsDb.findIndex((y) => y._id.toString() === e._id);
      if (index >= 0) {
        Object.keys(e).forEach((key) => (youngsDb[index][key] = e[key]));
        await youngsDb[index].save();
      }
    });
    await Promise.all(promise);
    await updateSeatsTakenInBusLine(busFrom);
    await updateSeatsTakenInBusLine(busTo);
    res.status(200).send({ ok: true, data: youngs });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/allLines/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (req.user.role !== "admin" || req.user.subRole !== "god") return res.status(401).send({ ok: false, code: ERRORS.UNAUTHORIZED });
    const { cohort } = req.params;
    let lines = await PlanTransportModel.find({ cohort: cohort }, "_id pointDeRassemblements busId centerRegion youngCapacity");
    if (!lines) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: lines });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (req.user.role !== "admin" || req.user.subRole !== "god") return res.status(401).send({ ok: false, code: ERRORS.UNAUTHORIZED });
    const { id } = req.params;
    await PlanTransportModel.findByIdAndDelete(id);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
