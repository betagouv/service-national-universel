const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const crypto = require("crypto");
const datefns = require("date-fns");
const { fr } = require("date-fns/locale");
const fileUpload = require("express-fileupload");

const { generateBatchCertifPhase1 } = require("../templates/certificate/phase1");
const { generateBatchDroitImage } = require("../templates/droitImage/droitImage");
const { capture } = require("../sentry");
const SessionPhase1Model = require("../models/sessionPhase1");
const CohesionCenterModel = require("../models/cohesionCenter");
const CohortModel = require("../models/cohort");
const YoungModel = require("../models/young");
const ReferentModel = require("../models/referent");
const PointDeRassemblementModel = require("../models/PlanDeTransport/pointDeRassemblement");
const LigneBusModel = require("../models/PlanDeTransport/ligneBus");
const sessionPhase1TokenModel = require("../models/sessionPhase1Token");
const schemaRepartitionModel = require("../models/PlanDeTransport/schemaDeRepartition");
const { ERRORS, updatePlacesSessionPhase1, isYoung, YOUNG_STATUS, uploadFile, deleteFile, getFile, updateHeadCenter } = require("../utils");
const {
  ROLES,
  SENDINBLUE_TEMPLATES,
  getCohortStartDate,
  SESSION_FILE_KEYS,
  canCreateOrUpdateSessionPhase1,
  canViewCohesionCenter,
  canSearchSessionPhase1,
  canViewSessionPhase1,
  canDownloadYoungDocuments,
  canShareSessionPhase1,
  canCreateOrUpdateCohesionCenter,
  isReferentOrAdmin,
  isSessionEditionOpen,
  canSendTimeScheduleReminderForSessionPhase1,
  canSendImageRightsForSessionPhase1,
} = require("snu-lib");
const { serializeSessionPhase1, serializeCohesionCenter } = require("../utils/serializer");
const { validateSessionPhase1, validateId } = require("../utils/validator");
const { sendTemplate } = require("../sendinblue");
const config = require("config");
const SessionPhase1 = require("../models/sessionPhase1");
const fs = require("fs");
const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../cryptoUtils");
const scanFile = require("../utils/virusScanner");
const { getMimeFromFile } = require("../utils/file");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateSessionPhase1(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canCreateOrUpdateSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await SessionPhase1Model.create(value);
    await updateHeadCenter(data.headCenterId, req.user);

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/schema-repartition", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // if (!canCreateOrUpdateCohesionCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const schema = await schemaRepartitionModel.find({ sessionId: id });
    return res.status(200).send({ ok: true, schema: schema });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.use("/", require("../sessionPhase1/sessionPhase1Controller"));

router.get("/:id/cohesion-center", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!cohesionCenter) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user)) {
      if (session._id.toString() !== req.user.sessionPhase1Id.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    } else if (!canViewCohesionCenter(req.user, cohesionCenter)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    return res.status(200).send({ ok: true, data: serializeCohesionCenter(cohesionCenter) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canViewSessionPhase1(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(session) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canSearchSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await SessionPhase1Model.find({});
    return res.status(200).send({ ok: true, data: data.map(serializeSessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const cohort = await CohortModel.findOne({ name: sessionPhase1.cohort });
    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!isSessionEditionOpen(req.user, cohort)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const { error, value } = validateSessionPhase1(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const cohesionCenter = await CohesionCenterModel.findById(sessionPhase1.cohesionCenterId);
    if (cohesionCenter.placesTotal < value.placesTotal) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    let oldHeadCenterId = sessionPhase1.headCenterId;
    const hasHeadCenterChanged = oldHeadCenterId !== value.oldHeadCenterId;

    if (!value.dateStart || !value.dateEnd) {
      value.dateStart = undefined;
      value.dateEnd = undefined;
    } else {
      value.dateStart = formatDateTimeZone(value.dateStart);
      value.dateEnd = formatDateTimeZone(value.dateEnd);
    }

    sessionPhase1.set({ ...value });
    await sessionPhase1.save({ fromUser: req.user });
    await updateHeadCenter(sessionPhase1.headCenterId, req.user);
    if (hasHeadCenterChanged) {
      await updateHeadCenter(oldHeadCenterId, req.user);
    }

    const data = await updatePlacesSessionPhase1(sessionPhase1, req.user);
    res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/team", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (![ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN, ROLES.HEAD_CENTER].includes(req.user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const { error, value } = Joi.object({
      headCenterId: Joi.string().allow(null, ""),
      team: Joi.array().items(Joi.any().allow(null, "")),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    let oldHeadCenterId = sessionPhase1.headCenterId;
    const hasHeadCenterChanged = oldHeadCenterId !== value.oldHeadCenterId;

    sessionPhase1.set({ ...value });
    await sessionPhase1.save({ fromUser: req.user });
    await updateHeadCenter(sessionPhase1.headCenterId, req.user);
    if (hasHeadCenterChanged) {
      await updateHeadCenter(oldHeadCenterId, req.user);
    }
    res.status(200).send({ ok: true, data: serializeSessionPhase1(sessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/certificate", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!cohesionCenter) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canDownloadYoungDocuments(req.user, cohesionCenter)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const body = {
      sessionPhase1Id: session._id,
      statusPhase1: "DONE",
    };

    const youngs = await YoungModel.find(body);
    if (!youngs.length) {
      capture("No young found with body: " + JSON.stringify(body));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    const cohort = await CohortModel.findOne({ name: session.cohort });
    generateBatchCertifPhase1(res, youngs, session, cohort, cohesionCenter);
  } catch (error) {
    console.log("error", error);
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const sessionPhase1 = await SessionPhase1Model.findById(id);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canCreateOrUpdateCohesionCenter(req.user, sessionPhase1)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // check if youngs are registered to the session
    const youngs = await YoungModel.find({ sessionPhase1Id: sessionPhase1._id });
    if (sessionPhase1.placesTotal !== sessionPhase1.placesLeft || youngs.length > 0) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // check if a schema is linked to the session
    const schema = await schemaRepartitionModel.find({ sessionId: sessionPhase1._id });
    if (schema.length > 0) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    // delete cohort in cohesion center
    const cohesionCenter = await CohesionCenterModel.findById(sessionPhase1.cohesionCenterId);
    cohesionCenter.set({ cohorts: cohesionCenter.cohorts.filter((c) => c !== sessionPhase1.cohort) });
    cohesionCenter.save({ fromUser: req.user });

    await sessionPhase1.remove();
    await updateHeadCenter(sessionPhase1.headCenterId, req.user);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:sessionId/share", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      sessionId: Joi.string().required(),
      emails: Joi.array().items(Joi.string().lowercase().trim().email().required()).required().min(1),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const sessionPhase1 = await SessionPhase1Model.findById(value.sessionId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canShareSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    //Create token
    const cohort = await CohortModel.findOne({ name: sessionPhase1.cohort });
    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessionToken = await sessionPhase1TokenModel.create({
      token: crypto.randomBytes(50).toString("hex"),
      sessionId: sessionPhase1._id,
    });

    //Send emails to share session
    for (const email of value.emails) {
      await sendTemplate(SENDINBLUE_TEMPLATES.SHARE_SESSION_PHASE1, {
        emailTo: [{ email: email }],
        params: { link: `${config.ADMIN_URL}/session-phase1-partage?token=${sessionToken.token}`, session: sessionPhase1.cohort.toLowerCase() },
      });
    }

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/check-token/:token", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      token: Joi.string().required(),
    }).validate({ ...req.params }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const sessionPhase1Token = await sessionPhase1TokenModel.findOne({ token: value.token });
    if (!sessionPhase1Token) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessionPhase1 = await SessionPhase1Model.findById(sessionPhase1Token.sessionId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const cohortParam = await CohortModel.findOne({ name: sessionPhase1.cohort });
    if (!cohortParam) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (cohortParam?.busListAvailability) {
      let result = {
        noMeetingPoint: {
          youngs: [],
          meetingPoint: [],
        },
        transportInfoGivenByLocal: {
          youngs: [],
          meetingPoint: [],
        },
      };
      const youngs = await YoungModel.find({ status: YOUNG_STATUS.VALIDATED, sessionPhase1Id: sessionPhase1._id });
      console.log("youngs", youngs.length);

      const ligneBus = await LigneBusModel.find({ cohort: sessionPhase1.cohort, centerId: sessionPhase1.cohesionCenterId });

      let arrayMeetingPoints = [];
      ligneBus.map((l) => (arrayMeetingPoints = arrayMeetingPoints.concat(l.meetingPointsIds)));

      const meetingPoints = await PointDeRassemblementModel.find({ _id: { $in: arrayMeetingPoints } });

      for (const young of youngs) {
        const tempYoung = {
          _id: young._id,
          firstName: young.firstName,
          lastName: young.lastName,
          email: young.email,
          phone: young.phone,
          city: young.city,
          department: young.department,
          parent1FirstName: young.parent1FirstName,
          parent1LastName: young.parent1LastName,
          parent1Email: young.parent1Email,
          parent1Phone: young.parent1Phone,
          parent1Status: young.parent1Status,
          parent2FirstName: young.parent2FirstName,
          parent2LastName: young.parent2LastName,
          parent2Email: young.parent2Email,
          parent2Phone: young.parent2Phone,
          parent2Status: young.parent2Status,
          statusPhase1: young.statusPhase1,
          meetingPointId: young.meetingPointId,
        };
        if (young.deplacementPhase1Autonomous === "true") {
          result.noMeetingPoint.youngs.push(tempYoung);
        } else if (young.transportInfoGivenByLocal === "true") {
          result.transportInfoGivenByLocal.youngs.push(tempYoung);
        } else {
          const youngMeetingPoint = meetingPoints.find((meetingPoint) => meetingPoint._id.toString() === young.meetingPointId);
          const youngLigneBus = ligneBus.find((ligne) => ligne._id.toString() === young.ligneId && young?.cohesionStayPresence !== "false" && young?.departInform !== "true");
          if (youngMeetingPoint && youngLigneBus) {
            if (!result[youngLigneBus.busId]) {
              result[youngLigneBus.busId] = {};
              result[youngLigneBus.busId]["youngs"] = [];
              result[youngLigneBus.busId]["ligneBus"] = [];
              result[youngLigneBus.busId]["meetingPoint"] = [];
            }
            if (!result[youngLigneBus.busId]["meetingPoint"].find((meetingPoint) => meetingPoint._id.toString() === youngMeetingPoint._id.toString())) {
              result[youngLigneBus.busId]["meetingPoint"].push(youngMeetingPoint);
            }
            if (!result[youngLigneBus.busId]["ligneBus"].find((ligne) => ligne._id.toString() === young.ligneId)) {
              result[youngLigneBus.busId]["ligneBus"].push(youngLigneBus);
            }
            result[youngLigneBus.busId]["youngs"].push(tempYoung);
          }
        }
      }

      res.status(200).send({ ok: true, data: result });
    } else {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/headCenter", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!isReferentOrAdmin(req.user) && req.user.role !== ROLES.HEAD_CENTER) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (sessionPhase1.headCenterId) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error: errorIdHeadCenter, value: checkedIdHeadCenter } = validateId(req.body.id);
    if (errorIdHeadCenter) {
      capture(errorIdHeadCenter);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const referent = await ReferentModel.findById(checkedIdHeadCenter);
    if (referent.role !== ROLES.HEAD_CENTER) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Cannot be head of center in more than one centers for the same cohort
    const overlappingSessionPhase1 = await SessionPhase1Model.find({ cohort: sessionPhase1.cohort, headCenterId: checkedIdHeadCenter });
    if (overlappingSessionPhase1.length > 0) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    sessionPhase1.set({ headCenterId: checkedIdHeadCenter });
    await sessionPhase1.save({ fromUser: req.user });
    await updateHeadCenter(checkedIdHeadCenter, req.user);

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id/headCenter", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!isReferentOrAdmin(req.user) && req.user.role !== ROLES.HEAD_CENTER) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const oldHeadCenterId = sessionPhase1.headCenterId;

    sessionPhase1.set({ headCenterId: undefined });
    await sessionPhase1.save({ fromUser: req.user });
    await updateHeadCenter(oldHeadCenterId, req.user);

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Upload a new time schedule file in session (id)
 */
router.post(
  "/:id/:key",
  passport.authenticate(["referent"], { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      // --- validate
      const { error, value } = Joi.object({
        id: Joi.string().alphanum().length(24).required(),
        key: Joi.string()
          .valid(...SESSION_FILE_KEYS)
          .required(),
      }).validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      const { id: sessionId, key } = value;

      // --- rights
      const session = await SessionPhase1.findById(sessionId);
      if (!session) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      if (!canCreateOrUpdateSessionPhase1(req.user, session)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const files = Object.values(req.files);
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      const file = files[0];

      const { name, tempFilePath, mimetype, size } = file;
      const filetype = await getMimeFromFile(tempFilePath);
      const mimeFromMagicNumbers = filetype || "application/pdf";
      const validTypes = ["image/jpeg", "image/png", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      }

      const scanResult = await scanFile(tempFilePath, name, req.user.id);
      if (scanResult.infected) {
        return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
      }

      const newFile = {
        _id: mongoose.Types.ObjectId(),
        name,
        size,
        uploadedAt: Date.now(),
        mimetype,
      };
      const data = fs.readFileSync(tempFilePath);
      const encryptedBuffer = encrypt(data);
      const resultingFile = { mimetype: mimeFromMagicNumbers, encoding: "7bit", data: encryptedBuffer };
      await uploadFile(`app/session/${sessionId}/${key}/${newFile._id}`, resultingFile);
      fs.unlinkSync(tempFilePath);

      // Add file to session & save
      newFile._id = newFile._id.toString();
      if (key === "time-schedule") {
        session.timeScheduleFiles.push(newFile);
        session.set("hasTimeSchedule", "true");
      }
      if (key === "pedago-project") {
        session.pedagoProjectFiles.push(newFile);
        session.set("hasPedagoProject", "true");
      }

      await session.save({ fromUser: req.user });
      return res.status(200).send({ session: serializeSessionPhase1(session), data: newFile, ok: true });
    } catch (error) {
      capture(error);
      if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

/**
 * Delete a time schedule file (fileId) in session (sessionId)
 */
router.delete("/:sessionId/:key/:fileId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...SESSION_FILE_KEYS)
        .required(),
      fileId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId, key, fileId } = value;

    // --- rights
    const session = await SessionPhase1.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!canCreateOrUpdateSessionPhase1(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- remove file
    if (key === "time-schedule") {
      const index = session.timeScheduleFiles ? session.timeScheduleFiles.findIndex((f) => f._id === fileId) : -1;
      if (index < 0) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      const [file] = session.timeScheduleFiles.splice(index, 1);
    }
    if (key === "pedago-project") {
      const index = session.pedagoProjectFiles ? session.pedagoProjectFiles.findIndex((f) => f._id === fileId) : -1;
      if (index < 0) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      const [file] = session.pedagoProjectFiles.splice(index, 1);
    }
    try {
      await deleteFile(`app/session/${sessionId}/${key}/${fileId}`);
    } catch (err) {
      capture(err);
    }

    // --- save & return
    session.set("hasTimeSchedule", session.timeScheduleFiles.length > 0 ? "true" : "false");
    session.set("hasPedagoProject", session.pedagoProjectFiles.length > 0 ? "true" : "false");

    await session.save({ fromUser: req.user });

    return res.status(200).send({ data: session, ok: true });
  } catch (error) {
    capture(error);
    if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Download a time schedule file (fileId) from session (sessionId).
 */
router.get("/:sessionId/:key/:fileId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...SESSION_FILE_KEYS)
        .required(),
      fileId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId, key, fileId } = value;

    // --- rights
    const session = await SessionPhase1.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!canViewSessionPhase1(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const file = key === "time-schedule" ? session.timeScheduleFiles.find((f) => f._id === fileId) || null : session.pedagoProjectFiles.find((f) => f._id === fileId) || null;

    if (!file) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // --- Download from s3
    const downloaded = await getFile(`app/session/${sessionId}/${key}/${fileId}`);
    if (!downloaded) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // --- Send
    return res.status(200).send({
      data: Buffer.from(decrypt(downloaded.Body), "base64"),
      mimeType: file.mime,
      fileName: file.name,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:sessionId/:key/send-reminder", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
      key: Joi.string()
        .valid(...SESSION_FILE_KEYS)
        .required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId, key } = value;

    // --- rights
    const session = await SessionPhase1.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!canSendTimeScheduleReminderForSessionPhase1(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- get headCenter
    const headCenter = await ReferentModel.findById(session.headCenterId);
    if (!headCenter) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (headCenter.email === null || headCenter.email === undefined) {
      return res.status(400).send({ ok: false, code: ERRORS.EMAIL_INVALID });
    }

    // --- send template
    const cohort = await CohortModel.findOne({ name: session.cohort });
    let date = getCohortStartDate(session, cohort);

    await sendTemplate(SENDINBLUE_TEMPLATES.headCenter.FILE_SESSION_REMINDER, {
      emailTo: [{ email: headCenter.email }],
      params: {
        fileName: key === "time-schedule" ? "l'emploi du temps" : key === "pedago-project" ? "le projet pédagogique" : null,
        date: date ? datefns.format(date, "dd MMMM yyyy", { locale: fr }) : "?",
        cohesioncenter: session.nameCentre,
        cta: `${config.ADMIN_URL}/centre/${session.cohesionCenterId}?sessionId=${session._id}`,
      },
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:sessionId/image-rights/export", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId } = value;
    // --- rights
    const session = await SessionPhase1.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!canSendImageRightsForSessionPhase1(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    // --- found youngs
    const youngs = await YoungModel.find({ sessionPhase1Id: session._id }).sort({ lastName: 1, firstName: 1 });

    generateBatchDroitImage(res, youngs);
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const formatDateTimeZone = (date) => {
  //set timezone to UTC
  let d = new Date(date);
  d.toISOString();
  return d;
};

module.exports = router;
