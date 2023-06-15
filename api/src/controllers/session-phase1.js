const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const crypto = require("crypto");
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
const {
  ERRORS,
  updatePlacesSessionPhase1,
  getSignedUrl,
  getBaseUrl,
  sanitizeAll,
  isYoung,
  YOUNG_STATUS,
  uploadFile,
  deleteFile,
  getFile,
  updateHeadCenter,
  timeout,
} = require("../utils");
const Zip = require("adm-zip");
const {
  ROLES,
  SENDINBLUE_TEMPLATES,
  MINISTRES,
  COHESION_STAY_LIMIT_DATE,
  COHESION_STAY_END,
  END_DATE_PHASE1,
  PHASE1_YOUNG_ACCESS_LIMIT,
  START_DATE_SESSION_PHASE1,
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
  canPutSpecificDateOnSessionPhase1,
} = require("snu-lib");
const { serializeSessionPhase1, serializeCohesionCenter } = require("../utils/serializer");
const { validateSessionPhase1, validateId } = require("../utils/validator");
const renderFromHtml = require("../htmlToPdf");
const { sendTemplate } = require("../sendinblue");
const { ADMIN_URL } = require("../config");

const datefns = require("date-fns");
const { fr } = require("date-fns/locale");
const fileUpload = require("express-fileupload");
const SessionPhase1 = require("../models/sessionPhase1");
const FileType = require("file-type");
const fs = require("fs");
const config = require("../config");
const NodeClam = require("clamscan");
const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../cryptoUtils");
const { readTemplate, renderWithTemplate } = require("../templates/droitImage");
const fetch = require("node-fetch");

const TIMEOUT_PDF_SERVICE = 15000;

const getCohesionCenterLocation = (cohesionCenter) => {
  let t = "";
  if (cohesionCenter.city) {
    t = `à ${cohesionCenter.city}`;
    if (cohesionCenter.zip) {
      t += `, ${cohesionCenter.zip}`;
    }
  }
  return t;
};

const getMinistres = (date) => {
  if (!date) return;
  for (const item of MINISTRES) {
    if (date < new Date(item.date_end)) return item;
  }
};

const destinataireLabel = ({ firstName, lastName }, ministres) => {
  return `félicite${ministres.length > 1 ? "nt" : ""} <strong>${firstName} ${lastName}</strong>`;
};

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

    const { errorBody } = Joi.object({
      options: Joi.object().allow(null, {}),
    }).validate({ ...req.body }, { stripUnknown: true });
    if (errorBody) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

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
    if (!youngs) {
      capture("No young found with body: " + JSON.stringify(body));
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    let html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Attestation phase 1 - SNU</title>
      <link rel="stylesheet" href="{{BASE_URL}}/css/style.css" />
    </head>

    <body style="margin: 0; font-family: Marianne, Helvetica, Arial, sans-serif">
      {{BODY}}
    </body>
</html>`;

    const subHtml = `
  <div style="position: relative; margin: 0;min-height:100vh;width:100%;max-height:100vh;">
    <img class="bg" src="{{GENERAL_BG}}" id="bg" alt="bg" />
      <div class="container">
        <div class="text-center l4">
        <br />
          <p>{{TO}}, volontaire à l'édition {{COHORT}},</p>
          <p>pour la réalisation de son <strong>séjour de cohésion</strong>, {{COHESION_DATE}}, au centre de :</p>
          <p>{{COHESION_CENTER_NAME}} {{COHESION_CENTER_LOCATION}},</p>
          <p>validant la <strong>phase 1</strong> du Service National Universel.</p>
          <br />
          <p class="text-date">Fait le {{DATE}}</p>
        </div>
      </div>
    </div>`;

    if (!youngs || youngs.length === 0) {
      return res.status(400).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });
    }

    const data = [];
    const d = COHESION_STAY_END[youngs[0].cohort];
    const ministresData = getMinistres(d);
    const template = ministresData.template;
    const cohesionCenterLocation = getCohesionCenterLocation(cohesionCenter);
    for (const young of youngs) {
      data.push(
        subHtml
          .replace(/{{TO}}/g, sanitizeAll(destinataireLabel(young, ministresData.ministres)))
          .replace(/{{COHORT}}/g, sanitizeAll({ ...END_DATE_PHASE1, ...PHASE1_YOUNG_ACCESS_LIMIT }[young.cohort]?.getYear() + 1900))
          .replace(/{{COHESION_DATE}}/g, sanitizeAll(COHESION_STAY_LIMIT_DATE[young.cohort]?.toLowerCase()))
          .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(cohesionCenter.name || ""))
          .replace(/{{COHESION_CENTER_LOCATION}}/g, sanitizeAll(cohesionCenterLocation))
          .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
          .replace(/{{GENERAL_BG}}/g, sanitizeAll(getSignedUrl(template)))
          .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }))),
      );
    }

    const newhtml = html.replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl())).replace(/{{BODY}}/g, data.join(""));

    const buffer = await renderFromHtml(newhtml, req.body.options || { format: "A4", margin: 0 });

    res.contentType("application/pdf");
    res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(buffer);
  } catch (error) {
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
        params: { link: `${ADMIN_URL}/session-phase1-partage?token=${sessionToken.token}`, session: sessionPhase1.cohort.toLowerCase() },
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
  "/:id/time-schedule",
  passport.authenticate(["referent"], { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      // --- validate
      const { error, value } = Joi.object({
        id: Joi.string().alphanum().length(24).required(),
      }).validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      const { id: sessionId } = value;

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
      const filetype = await FileType.fromFile(tempFilePath);
      const mimeFromMagicNumbers = filetype ? filetype.mime : "application/pdf";
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      }

      if (config.ENVIRONMENT === "staging" || config.ENVIRONMENT === "production") {
        try {
          const clamscan = await new NodeClam().init({
            removeInfected: true,
          });
          const { isInfected } = await clamscan.isInfected(tempFilePath);
          if (isInfected) {
            capture(`File ${name} of user(${req.user.id})is infected`);
            return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
          }
        } catch {
          return res.status(500).send({ ok: false, code: ERRORS.FILE_SCAN_DOWN });
        }
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
      await uploadFile(`app/session/${sessionId}/time-schedule/${newFile._id}`, resultingFile);
      fs.unlinkSync(tempFilePath);

      // Add file to session & save
      newFile._id = newFile._id.toString();
      session.timeScheduleFiles.push(newFile);
      session.set("hasTimeSchedule", "true");

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
router.delete("/:sessionId/time-schedule/:fileId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
      fileId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId, fileId } = value;

    // --- rights
    const session = await SessionPhase1.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!canCreateOrUpdateSessionPhase1(req.user, session)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- remove file
    const index = session.timeScheduleFiles ? session.timeScheduleFiles.findIndex((f) => f._id === fileId) : -1;
    if (index < 0) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const [file] = session.timeScheduleFiles.splice(index, 1);
    try {
      await deleteFile(`app/session/${sessionId}/time-schedule/${fileId}`);
    } catch (err) {
      capture(err);
    }

    // --- save & return
    session.set("hasTimeSchedule", session.timeScheduleFiles.length > 0 ? "true" : "false");
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
router.get("/:sessionId/time-schedule/:fileId", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate
    const { error, value } = Joi.object({
      sessionId: Joi.string().alphanum().length(24).required(),
      fileId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { sessionId, fileId } = value;

    // --- rights
    const session = await SessionPhase1.findById(sessionId);
    if (!session) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (!canViewSessionPhase1(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const file = session.timeScheduleFiles ? session.timeScheduleFiles.find((f) => f._id === fileId) : null;
    if (!file) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // --- Download from s3
    const downloaded = await getFile(`app/session/${sessionId}/time-schedule/${fileId}`);
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

router.post("/:sessionId/time-schedule/send-reminder", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
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
    let date = cohort ? cohort.dateStart : START_DATE_SESSION_PHASE1[session.cohort];

    await sendTemplate(SENDINBLUE_TEMPLATES.headCenter.TIME_SCHEDULE_REMINDER, {
      emailTo: [{ email: headCenter.email }],
      params: {
        date: date ? datefns.format(date, "dd MMMM yyyy", { locale: fr }) : "?",
        cohesioncenter: session.nameCentre,
        cta: `${ADMIN_URL}/centre/${session.cohesionCenterId}?sessionId=${session._id}&timeschedule=true`,
      },
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:sessionId/image-rights", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
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

    // --- start zip file
    let zip = new Zip();

    // --- build PDFS and zip'em
    const template = readTemplate();
    for (const young of youngs) {
      const html = renderWithTemplate(young, template);
      const body = await timeout(getPDF(html, { format: "A4", margin: 0 }), TIMEOUT_PDF_SERVICE);
      zip.addFile(young.lastName + " " + young.firstName + " - Droits à l'image.pdf", body);
    }

    // --- send zip file
    res.set({
      "content-disposition": `inline; filename="droits-image.zip"`,
      "content-type": "application/zip",
      "cache-control": "public, max-age=1",
    });
    res.status(200).end(zip.toBuffer());
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

async function getPDF(html, options) {
  const response = await fetch(config.API_PDF_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/pdf" },
    body: JSON.stringify({ html, options }),
  });

  if (response.status && response.status !== 200) {
    throw new Error("Error with PDF service");
  }

  return stream2buffer(response.body);
}

function stream2buffer(stream) {
  return new Promise((resolve, reject) => {
    const buf = [];
    stream.on("data", (chunk) => buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(buf)));
    stream.on("error", (err) => reject(err));
  });
}

const formatDateTimeZone = (date) => {
  //set timezone to UTC
  let d = new Date(date);
  d.toISOString();
  return d;
};

module.exports = router;
