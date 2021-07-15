const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");

const MissionObject = require("../models/mission");
const UserObject = require("../models/referent");
const ApplicationObject = require("../models/application");
const StructureObject = require("../models/structure");
const ReferentObject = require("../models/referent");
const { ERRORS } = require("../utils/index.js");
const { validateId } = require("../utils/validator/default");
const youngValidator = require("../utils/validator/young");
const referentValidator = require("../utils/validator/referent");

const canModify = (user, mission) => {
  return !(
    (user.role === "referent_department" && user.department !== mission.department) ||
    (user.role === "referent_region" && user.region !== mission.region)
  );
};

router.post("/", async (req, res) => {
  try {
    const { error, value: checkedMission } = youngValidator.validateMission(req.body);
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
    const { error: errorMission, value: checkedMission } = referentValidator.validateMission(req.body);
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
    const { error: errorMission, value: checkedMission } = referentValidator.validateMission(req.body);
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
    const { error, value: checkedId } = validateId(req.params.id);
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

router.get("/:id/patches", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const mission = await MissionObject.findById(req.params.id);
    if (!mission) {
      capture(`mission not found ${req.params.id}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const data = await mission.patches.find({ ref: mission.id }).sort("-date");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/structure/:structureId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.structureId);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const data = await MissionObject.find({ structureId: checkedId });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id/structure/:structureId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorStructureId, value: checkedStructureId } = validateId(req.params.structureId);
    if (errorId || errorStructureId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });
    const structure = await StructureObject.findById(checkedStructureId);
    const mission = await MissionObject.findById(checkedId);
    mission.set({ structureId: structure._id, structureName: structure.name });
    await mission.save();
    const applications = await ApplicationObject.find({ missionId: checkedId });
    applications.forEach(async (application) => {
      application.set({ structureId: structure._id });
      await application.save();
    });
    const referents = await ReferentObject.find({ _id: mission.tutorId });
    referents.forEach(async (referent) => {
      referent.set({ structureId: structure._id });
      await referent.save();
    });
    return res.status(200).send({ ok: true, data: mission });
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
    const { error, value: checkedId } = validateId(req.params.id);
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
