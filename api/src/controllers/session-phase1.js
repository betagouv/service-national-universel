const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const SessionPhase1Model = require("../models/sessionPhase1");
const CohesionCenterModel = require("../models/cohesionCenter");
const YoungModel = require("../models/young");
const MeetingPointObject = require("../models/meetingPoint");
const BusObject = require("../models/bus");
const { ERRORS, updatePlacesSessionPhase1, updatePlacesBus, getSignedUrl, getBaseUrl, sanitizeAll } = require("../utils");
const { canCreateOrUpdateSessionPhase1 } = require("snu-lib/roles");
const { serializeSessionPhase1, serializeCohesionCenter, serializeYoung } = require("../utils/serializer");
const { validateSessionPhase1, validateId } = require("../utils/validator");
const renderFromHtml = require("../htmlToPdf");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateSessionPhase1(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    if (!canCreateOrUpdateSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await SessionPhase1Model.create(value);
    return res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const data = await SessionPhase1Model.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/cohesion-center", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const session = await SessionPhase1Model.findById(id);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!cohesionCenter) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeCohesionCenter(cohesionCenter) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await SessionPhase1Model.find({});
    return res.status(200).send({ ok: true, data: data.map(serializeSessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: errorId });

    const sessionPhase1 = await SessionPhase1Model.findById(checkedId);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canCreateOrUpdateSessionPhase1(req.user, sessionPhase1)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error, value } = validateSessionPhase1(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    sessionPhase1.set(value);
    await sessionPhase1.save();

    const data = await updatePlacesSessionPhase1(sessionPhase1);
    res.status(200).send({ ok: true, data: serializeSessionPhase1(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/:id/certificate", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  const { error, value: id } = Joi.string().required().validate(req.params.id);
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

  const session = await SessionPhase1Model.findById(id);
  if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const cohesionCenter = await CohesionCenterModel.findById(session.cohesionCenterId);
  if (!cohesionCenter) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const body = {
    sessionPhase1Id: session._id,
    cohesionStayPresence: "true",
  };

  const youngs = await YoungModel.find(body);

  const getLocationCohesionCenter = (cohesionCenter) => {
    let t = "";
    if (cohesionCenter.city) {
      t = `à ${cohesionCenter.city}`;
      if (cohesionCenter.zip) {
        t += `, ${cohesionCenter.zip}`;
      }
    }
    return t;
  };

  let html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Attestation phase 1 - SNU</title>
      <link rel="stylesheet" href="{{BASE_URL}}/css/style.css" />
    </head>
  
    <body style="margin: 0;">
      {{BODY}}
    </body>
  </html>`;

  const subHtml = `<div style="position: relative; margin: 0;min-height:100vh;width:100%;max-height:100vh;">
  <img class="bg" src="{{GENERAL_BG}}" id="bg" alt="bg" style="min-height:100vh;width:100%;" />
  <div class="container">
    <div class="text-center l4">
      <p>félicitent <strong>{{FIRST_NAME}} {{LAST_NAME}}</strong>, volontaire à l'édition <strong>{{COHORT}}</strong>,</p>
      <p>pour la réalisation de son <strong>séjour de cohésion</strong> au centre de :</p>
      <p>{{COHESION_CENTER_NAME}} {{COHESION_CENTER_LOCATION}},</p>
      <p>validant la <strong>phase 1</strong> du Service National Universel.</p>
      <br />
      <p class="text-date">Fait le {{DATE}}</p>
    </div>
  </div>
</div>`;

  const template = getSignedUrl("certificates/certificateTemplate.png");
  const d = new Date();
  const data = [];
  for (const young of youngs) {
    data.push(
      subHtml
        .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
        .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
        .replace(/{{COHORT}}/g, sanitizeAll(session.cohort))
        .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(cohesionCenter.name || ""))
        .replace(/{{COHESION_CENTER_LOCATION}}/g, sanitizeAll(getLocationCohesionCenter(cohesionCenter)))
        .replace(/{{GENERAL_BG}}/g, sanitizeAll(template))
        .replace(/{{DATE}}/g, sanitizeAll(d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }))),
    );
  }

  const newhtml = html.replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl())).replace(/{{BODY}}/g, data.join(""));

  const buffer = await renderFromHtml(newhtml, req.body.options || { format: "A4", margin: 0 });

  res.contentType("application/pdf");
  res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
  res.set("Cache-Control", "public, max-age=1");
  res.send(buffer);
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const sessionPhase1 = await SessionPhase1Model.findById(id);
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canCreateOrUpdateSessionPhase1(req.user, sessionPhase1)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    await sessionPhase1.remove();

    console.log(`sessionPhase1 ${id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:sessionId/assign-young/:youngId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ youngId: Joi.string().required(), sessionId: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });

    const { youngId, sessionId } = value;
    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const session = await SessionPhase1Model.findById(sessionId);
    if (!session) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const oldSession = young.sessionPhase1Id ? await SessionPhase1Model.findById(young.sessionPhase1Id) : null;

    // update youngs infos
    young.set({
      status: "VALIDATED",
      statusPhase1: "AFFECTED",
      sessionPhase1Id: sessionId,
    });

    //if the young has already a meetingPoint and therefore a place taken in a bus
    let bus = null;
    if (young.meetingPointId) {
      console.log(`affecting ${young.id} but is already in meetingPoint ${young.meetingPointId}`);
      const meetingPoint = await MeetingPointObject.findById(young.meetingPointId);
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      bus = await BusObject.findById(meetingPoint.busId);
      if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      console.log(`${young.id} is in bus ${bus.idExcel}`);
    }

    // if young has confirmed their meetingPoint, we will cancel it
    if (young.meetingPointId || young.deplacementPhase1Autonomous === "true") {
      young.set({ meetingPointId: undefined, deplacementPhase1Autonomous: undefined });
    }

    await young.save({ fromUser: req.user });

    // update session infos
    const data = await updatePlacesSessionPhase1(session);
    if (oldSession) await updatePlacesSessionPhase1(oldSession);
    if (bus) await updatePlacesBus(bus);

    return res.status(200).send({
      data: serializeSessionPhase1(data, req.user),
      young: serializeYoung(young, req.user),
      ok: true,
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
