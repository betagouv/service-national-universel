const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");

const MissionObject = require("../models/mission");
const UserObject = require("../models/referent");
const ApplicationObject = require("../models/application");
const { ERRORS } = require("../utils/index.js");
const { validateId } = require("../utils/defaultValidate");
const validateFromYoung = require("../utils/young");
const validateFromReferent = require("../utils/referent");

const canModify = (user, mission) => {
  return !(
    (user.role === "referent_department" && user.department !== mission.department) ||
    (user.role === "referent_region" && user.region !== mission.region)
  );
};

router.post("/", async (req, res) => {
  try {
    const obj = {};
    // if (req.body.hasOwnProperty(`jobboard_indeed_status`)) obj.jobboard_indeed_status = req.body.jobboard_indeed_status;
    const { error: error, value: checkedMission } = validateFromYoung.validateMission(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await MissionObject.create(checkedMission);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.body._id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const m = await MissionObject.findById(checkedId);
    if (!canModify(req.user, m)) return res.status(404).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const { error: errorMission, value: checkedMission } = validateFromReferent.validateMission(req.body);
    if (errorMission) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const mission = await MissionObject.findByIdAndUpdate(checkedId, checkedMission, { new: true });
    res.status(200).send({ ok: true, data: mission });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const m = await MissionObject.findById(checkedId);
    if (!canModify(req.user, m)) return res.status(404).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const { error: errorMission, value: checkedMission } = validateFromReferent.validateMission(req.body);
    if (errorMission) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const mission = await MissionObject.findByIdAndUpdate(checkedId, checkedMission, { new: true });
    res.status(200).send({ ok: true, data: mission });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { error: error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const data = await MissionObject.findOne({ _id: checkedId });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const mission = data.toJSON();

    if (mission.tutorId) {
      const tutor = await UserObject.findOne({ _id: mission.tutorId });
      if (tutor) {
        mission.tutor = { firstName: tutor.firstName, lastName: tutor.lastName, email: tutor.email, id: tutor._id };
      }
    }
    const application = await ApplicationObject.findOne({ missionId: req.params.id, youngId: req.user._id });
    return res.status(200).send({ ok: true, data: { ...mission, application } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/structure/:structureId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error: error, value: checkedId } = validateId(req.params.structureId);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const data = await MissionObject.find({ structureId: checkedId });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// router.get("/", async (req, res) => {
//   try {
//     const data = ""; //await MissionObject.find(req.query);
//     return res.status(200).send({ ok: true, data });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
//   }
// });

//@check
router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error: error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const mission = await MissionObject.findOne({ _id: checkedId });
    const applications = await ApplicationObject.find({ missionId: mission._id });
    if (applications && applications.length) return res.status(500).send({ ok: false, code: ERRORS.LINKED_OBJECT });
    await mission.remove();
    console.log(`Mission ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
