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
// eslint-disable-next-line no-unused-vars
const { ERRORS, isYoung } = require("../utils/index.js");
const { updateApplicationStatus, updateApplicationTutor, getAuthorizationToApply } = require("../services/application");
const { getTutorName } = require("../services/mission");
const { validateId, validateMission } = require("../utils/validator");
const { SENDINBLUE_TEMPLATES, MISSION_STATUS, ROLES, canCreateOrModifyMission, canViewMission, canModifyMissionStructureId } = require("snu-lib");
const { serializeMission, serializeApplication } = require("../utils/serializer");
const patches = require("./patches");
const { sendTemplate } = require("../sendinblue");
const { ADMIN_URL } = require("../config");
const { putLocation } = require("../services/gouv.fr/api-adresse");

//@todo: temporary fix for avoiding date inconsistencies (only works for French metropolitan timezone)
const fixDate = (dateString) => {
  const date = new Date(dateString);
  if (date.getUTCHours() >= 22) {
    const hoursToAdd = 24 - date.getUTCHours();
    const newDate = new Date(date).setUTCHours(date.getUTCHours() + hoursToAdd);
    return new Date(newDate).toISOString();
  }
  return dateString;
};

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedMission } = validateMission(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    }

    let structure = {};
    let responsible;
    if (checkedMission.tutorId) {
      responsible = await UserObject.findById(checkedMission.tutorId);
    }

    if (req.user.role === ROLES.SUPERVISOR) structure = await StructureObject.findById(checkedMission.structureId);

    if (!canCreateOrModifyMission(req.user, checkedMission, structure)) return res.status(403).send({ ok: false, code: ERRORS.FORBIDDEN });

    //@todo: temporary fix for avoiding date inconsistencies (only works for French metropolitan timezone)
    if (checkedMission.startAt) checkedMission.startAt = fixDate(checkedMission.startAt);
    if (checkedMission.endAt) checkedMission.endAt = fixDate(checkedMission.endAt);

    //set tutor name
    if (responsible) {
      checkedMission.tutorName = getTutorName(responsible);
    }

    if (checkedMission.status === MISSION_STATUS.WAITING_VALIDATION) {
      if (!checkedMission.location?.lat || !checkedMission.location?.lat) {
        checkedMission.location = await putLocation(checkedMission.city, checkedMission.zip);
        if (!checkedMission.location?.lat || !checkedMission.location?.lat) {
          return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
        }
      }
    }
    if (checkedMission?.hebergement === "false") {
      delete checkedMission.hebergementPayant;
    }
    const data = await MissionObject.create({ ...checkedMission, fromUser: req.user });

    if (data.status === MISSION_STATUS.WAITING_VALIDATION) {
      const referentsDepartment = await UserObject.find({
        department: checkedMission.department,
        subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
      });
      if (referentsDepartment?.length) {
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.NEW_MISSION, {
          emailTo: referentsDepartment?.map((referent) => ({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email })),
          params: {
            cta: `${ADMIN_URL}/mission/${data._id}`,
          },
        });
      }

      if (responsible)
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_VALIDATION, {
          emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
          params: {
            missionName: checkedMission.name,
          },
        });
    }

    return res.status(200).send({ ok: true, data: serializeMission(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const mission = await MissionObject.findById(checkedId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (req.user.role === ROLES.SUPERVISOR) var structure = await StructureObject.findById(mission.structureId);

    if (!canCreateOrModifyMission(req.user, mission, structure)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error: errorMission, value: checkedMission } = validateMission(req.body);
    if (errorMission) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    //@todo: temporary fix for avoiding date inconsistencies (only works for French metropolitan timezone)
    if (checkedMission.startAt) checkedMission.startAt = fixDate(checkedMission.startAt);
    if (checkedMission.endAt) checkedMission.endAt = fixDate(checkedMission.endAt);

    if (checkedMission.status === MISSION_STATUS.WAITING_VALIDATION) {
      if (!checkedMission.location?.lat || !checkedMission.location?.lat) {
        checkedMission.location = await putLocation(checkedMission.city, checkedMission.zip);
        if (!checkedMission.location?.lat || !checkedMission.location?.lat) {
          return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
        }
      }
    }

    if (checkedMission.status !== MISSION_STATUS.DRAFT) {
      // Sur changement de description ou actions, on doit revalider la mission
      if (checkedMission.description !== mission.description || checkedMission.actions !== mission.actions) {
        checkedMission.status = "WAITING_VALIDATION";
      }
    }
    if (checkedMission?.hebergement === "false") {
      delete checkedMission.hebergementPayant;
    }

    if (mission.placesTotal !== checkedMission.placesTotal) {
      if (mission.placesTotal < checkedMission.placesTotal) {
        mission.placesLeft = mission.placesLeft + (checkedMission.placesTotal - mission.placesTotal);
      } else if (checkedMission.placesTotal < mission.placesTotal) {
        mission.placesLeft = mission.placesLeft - (mission.placesTotal - checkedMission.placesTotal);
        if (mission.placesLeft < 0) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
    }

    const oldName = mission.name;
    const oldDepartment = mission.department;
    const oldRegion = mission.region;

    const oldStatus = mission.status;

    const oldTutorId = mission.tutorId;

    if (checkedMission.tutorId && checkedMission.tutorId !== oldTutorId) {
      const responsible = await ReferentObject.findById(checkedMission.tutorId);
      checkedMission.tutorName = await getTutorName(responsible);
    }

    mission.set(checkedMission);
    await mission.save({ fromUser: req.user });

    // if there is a name, department , region update the application
    if (oldName !== mission.name || oldDepartment !== mission.department || oldRegion !== mission.region) {
      // fetch all applications
      const applications = await ApplicationObject.find({ missionId: mission._id });
      for (const application of applications) {
        application.set({ missionName: mission.name, missionDepartment: mission.department, missionRegion: mission.region });
        await application.save({ fromUser: req.user });
      }
    }

    // if there is a tutor change, update the application tutor as well
    if (oldTutorId !== mission.tutorId) {
      updateApplicationTutor(mission, req.user);
    }

    // if there is a status change, update the application
    if (oldStatus !== mission.status) {
      await updateApplicationStatus(mission, req.user);
      if (mission.status === MISSION_STATUS.WAITING_VALIDATION) {
        const referentsDepartment = await UserObject.find({
          department: checkedMission.department,
          subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
        });
        if (referentsDepartment?.length) {
          await sendTemplate(SENDINBLUE_TEMPLATES.referent.NEW_MISSION, {
            emailTo: referentsDepartment?.map((referent) => ({ name: `${referent.firstName} ${referent.lastName}`, email: referent.email })),
            params: {
              cta: `${ADMIN_URL}/mission/${mission._id}`,
            },
          });
        }
        const responsible = await UserObject.findById(mission.tutorId);
        if (responsible)
          await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_WAITING_VALIDATION, {
            emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
            params: {
              missionName: mission.name,
            },
          });
      }
      if (mission.status === MISSION_STATUS.VALIDATED) {
        const responsible = await UserObject.findById(mission.tutorId);
        if (responsible)
          await sendTemplate(SENDINBLUE_TEMPLATES.referent.MISSION_VALIDATED, {
            emailTo: [{ name: `${responsible.firstName} ${responsible.lastName}`, email: responsible.email }],
            params: {
              cta: `${ADMIN_URL}/dashboard`,
              missionName: mission.name,
            },
          });
      }
    }

    res.status(200).send({ ok: true, data: mission });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/multiaction/change-tutor", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      ids: Joi.array().items(Joi.string().required()).required(),
      tutorId: Joi.string().required(),
      tutorName: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { tutorId, tutorName, ids } = value;

    const missions = await MissionObject.find({ _id: { $in: ids } });
    if (missions?.length !== ids.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (missions.some((mission) => !canCreateOrModifyMission(req.user, mission))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    for (let mission of missions) {
      mission.set({ tutorId, tutorName });
      await mission.save({ fromUser: req.user });
      // @todo need to send email to the new tutor ?
      await updateApplicationTutor(mission, req.user);
    }

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const mission = await MissionObject.findById(checkedId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isYoung(req.user) && !canViewMission(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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
          ...(await getAuthorizationToApply(mission, req.user)),
        },
      });
    }
    return res.status(200).send({ ok: true, data: { ...serializeMission(mission), tutor: missionTutor } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => await patches.get(req, res, MissionObject));

router.get("/:id/application", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewMission(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let data = [];
    if (req.user.role === ROLES.RESPONSIBLE || req.user.role === ROLES.SUPERVISOR) {
      data = await ApplicationObject.find({ missionId: id, status: { $ne: "WAITING_ACCEPTATION " } });
    } else data = await ApplicationObject.find({ missionId: id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    for (let i = 0; i < data.length; i++) {
      const application = data[i];
      const mission = await MissionObject.findById(application.missionId);
      data[i] = { ...serializeApplication(application), mission };
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Change the structure of a mission.
router.put("/:id/structure/:structureId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorStructureId, value: checkedStructureId } = validateId(req.params.structureId);
    if (errorId || errorStructureId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canModifyMissionStructureId(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const structure = await StructureObject.findById(checkedStructureId);
    const mission = await MissionObject.findById(checkedId);
    if (!mission || !structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (mission.tutorId) {
      const missionReferent = await MissionObject.find({ tutorId: mission.tutorId });
      if (!missionReferent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (missionReferent.length > 1) return res.status(405).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

      const referent = await ReferentObject.findById(mission.tutorId);
      referent.set({ structureId: structure._id });
      await referent.save({ fromUser: req.user });
    }

    mission.set({ structureId: structure._id, structureName: structure.name });
    await mission.save({ fromUser: req.user });

    const applications = await ApplicationObject.find({ missionId: checkedId });
    for (const application of applications) {
      application.set({ structureId: structure._id });
      await application.save({ fromUser: req.user });
    }

    return res.status(200).send({ ok: true, data: serializeMission(mission) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const mission = await MissionObject.findById(checkedId);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canCreateOrModifyMission(req.user, mission)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const applications = await ApplicationObject.find({ missionId: mission._id });
    if (applications && applications.length) return res.status(409).send({ ok: false, code: ERRORS.LINKED_OBJECT });
    await mission.remove();

    console.log(`Mission ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
