const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const MissionObject = require("../models/mission");
const UserObject = require("../models/referent");
const ApplicationObject = require("../models/application");
const StructureObject = require("../models/structure");
const ReferentObject = require("../models/referent");
const { ERRORS, isYoung } = require("../utils/index.js");
const { validateId, validateMission } = require("../utils/validator");
const { canModifyMission } = require("snu-lib/roles");
const { MISSION_STATUS, APPLICATION_STATUS } = require("snu-lib/constants");
const { serializeMission, serializeApplication } = require("../utils/serializer");
const patches = require("./patches");
const { sendTemplate } = require("../sendinblue");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { APP_URL } = require("../config");

const updateApplication = async (mission) => {
  if (![MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED].includes(mission.status))
    return console.log(`no need to update applications, new status for mission ${mission._id} is ${mission.status}`);
  const applications = await ApplicationObject.find({
    missionId: mission._id,
    status: {
      $in: [
        APPLICATION_STATUS.WAITING_VALIDATION,
        APPLICATION_STATUS.WAITING_ACCEPTATION,
        APPLICATION_STATUS.WAITING_VERIFICATION,
        // APPLICATION_STATUS.VALIDATED,
        // APPLICATION_STATUS.IN_PROGRESS,
      ],
    },
  });
  for (let application of applications) {
    let statusComment = "";
    switch (mission.status) {
      case MISSION_STATUS.CANCEL:
        statusComment = "La mission a été annulée.";
        break;
      case MISSION_STATUS.ARCHIVED:
        statusComment = "La mission a été archivée.";
        break;
    }
    application.set({ status: APPLICATION_STATUS.CANCEL, statusComment });
    await application.save();

    await sendTemplate(SENDINBLUE_TEMPLATES.young.MISSION_CANCEL, {
      emailTo: [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }],
      params: {
        cta: `${APP_URL}/mission`,
      },
    });
  }
};

// todo : add canCreateOrUpdateMission()
// if admin or referent from the same area or responsoble or supervisor
// if structure is validated
router.post("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: checkedMission } = validateMission(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await MissionObject.create(checkedMission);
    return res.status(200).send({ ok: true, data: serializeMission(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const mission = await MissionObject.findById(checkedId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canModifyMission(req.user, mission)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error: errorMission, value: checkedMission } = validateMission(req.body);
    if (errorMission) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

    const oldStatus = mission.status;
    mission.set(checkedMission);
    await mission.save();

    // if there is a status change, update the application
    if (oldStatus !== mission.status) await updateApplication(mission);

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

    const mission = await MissionObject.findById(checkedId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // Add tutor info.
    let missionTutor;
    if (mission.tutorId) {
      const tutor = await UserObject.findById(mission.tutorId);
      if (tutor) missionTutor = { firstName: tutor.firstName, lastName: tutor.lastName, email: tutor.email, id: tutor._id };
    }

    // Add application for young.
    if (isYoung(req.user)) {
      const application = await ApplicationObject.findOne({ missionId: checkedId, youngId: req.user._id });
      return res.status(200).send({
        ok: true,
        data: {
          ...serializeMission(mission),
          tutor: missionTutor,
          application: application ? serializeApplication(application) : null,
        },
      });
    }
    return res.status(200).send({ ok: true, data: { ...serializeMission(mission), tutor: missionTutor } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false }), async (req, res) => await patches.get(req, res, MissionObject));

router.get("/:id/application", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const data = await ApplicationObject.find({ missionId: id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    for (let i = 0; i < data.length; i++) {
      const application = data[i];
      const mission = await MissionObject.findById(application.missionId);
      data[i] = { ...serializeApplication(application), mission };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Change the structure of a mission.
router.put("/:id/structure/:structureId", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorStructureId, value: checkedStructureId } = validateId(req.params.structureId);
    if (errorId || errorStructureId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });

    const structure = await StructureObject.findById(checkedStructureId);
    const mission = await MissionObject.findById(checkedId);
    if (!mission || !structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (mission.tutorId) {
      const missionReferent = await MissionObject.find({ tutorId: mission.tutorId });
      if (!missionReferent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (missionReferent.length > 1) return res.status(405).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

      const referent = await ReferentObject.findById(mission.tutorId);
      referent.set({ structureId: structure._id });
      await referent.save();
    }

    mission.set({ structureId: structure._id, structureName: structure.name });
    await mission.save();

    const applications = await ApplicationObject.find({ missionId: checkedId });
    for (const application of applications) {
      application.set({ structureId: structure._id });
      await application.save();
    }

    return res.status(200).send({ ok: true, data: serializeMission(mission) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });

    const mission = await MissionObject.findById(checkedId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const applications = await ApplicationObject.find({ missionId: mission._id });
    if (applications && applications.length) return res.status(409).send({ ok: false, code: ERRORS.LINKED_OBJECT });
    await mission.remove();

    console.log(`Mission ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
