const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const config = require("../config");
const Joi = require("joi");

const CohesionCenterModel = require("../models/cohesionCenter");
const ReferentModel = require("../models/referent");
const YoungModel = require("../models/young");
const MeetingPointObject = require("../models/meetingPoint");
const BusObject = require("../models/bus");
const { getSignedUrl } = require("../utils");
const { ERRORS, updatePlacesCenter, updatePlacesBus, sendAutoAffectationMail, sendAutoCancelMeetingPoint } = require("../utils");
const renderFromHtml = require("../htmlToPdf");

router.post("/refresh/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await CohesionCenterModel.findById(req.params.id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    await updatePlacesCenter(data);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  // Validate params.
  // const { error, value: inscriptionsGoals } = Joi.array()
  //   .items({
  //     department: Joi.string().required(),
  //     region: Joi.string(),
  //     max: Joi.number().allow(null),
  //   })
  //   .validate(req.body, { stripUnknown: true });
  const error = false;
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

  try {
    const data = await CohesionCenterModel.create(req.body);
    return res.status(200).send({ data, ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/:centerId/assign-young/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
  const error = false;
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

  try {
    const young = await YoungModel.findById(req.params.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const center = await CohesionCenterModel.findById(req.params.centerId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (center.placesLeft <= 0) return res.status(404).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    let oldCenter = null;
    if (young.cohesionCenterId) {
      oldCenter = await CohesionCenterModel.findById(young.cohesionCenterId);
    }

    // update youngs infos
    young.set({
      status: "VALIDATED",
      statusPhase1: "AFFECTED",
      cohesionCenterId: center._id,
      cohesionCenterName: center.name,
      cohesionCenterCity: center.city,
      cohesionCenterZip: center.zip,
      // autoAffectationPhase1ExpiresAt: Date.now() + 60 * 1000 * 60 * 48,
    });

    //if the young has already a meetingPoint and therefore a place taken in a bus
    let bus = null;
    if (young.meetingPointId) {
      console.log(`affect ${young.id} but is already in meetingPoint ${young.meetingPointId}`);
      const meetingPoint = await MeetingPointObject.findById(young.meetingPointId);
      if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      bus = await BusObject.findById(meetingPoint.busId);
      if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      console.log(`${young.id} is in bus ${bus.idExcel}`);
    }

    // if young has confirmed their meetingPoint, as we will cancel it, we notify them
    if (young.meetingPointId || young.deplacementPhase1Autonomous === "true") {
      young.set({ meetingPointId: undefined, deplacementPhase1Autonomous: undefined });
      await sendAutoCancelMeetingPoint(young);
    }

    await young.save();

    // await sendAutoAffectationMail(young, center);

    //if young is in waitingList of the center
    // todo check if the young is in antoher center's waiting list
    if (center.waitingList.indexOf(young._id) !== -1) {
      const i = center.waitingList.indexOf(young._id);
      center.waitingList.splice(i, 1);
      await center.save();
    }
    if (oldCenter && oldCenter.waitingList.indexOf(young._id) !== -1) {
      const i = oldCenter.waitingList.indexOf(young._id);
      oldCenter.waitingList.splice(i, 1);
      await oldCenter.save();
    }
    // update center infos
    const data = await updatePlacesCenter(center);
    if (oldCenter) await updatePlacesCenter(oldCenter);
    if (bus) await updatePlacesBus(bus);

    return res.status(200).send({ data, young, ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});
router.post("/:centerId/assign-young-waiting-list/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
  // Validate params.
  // const { error, value: inscriptionsGoals } = Joi.array()
  //   .items({
  //     department: Joi.string().required(),
  //     region: Joi.string(),
  //     max: Joi.number().allow(null),
  //   })
  //   .validate(req.body, { stripUnknown: true });
  const error = false;
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

  try {
    const young = await YoungModel.findById(req.params.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const center = await CohesionCenterModel.findById(req.params.centerId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // update youngs infos
    young.set({
      statusPhase1: "WAITING_LIST",
      cohesionCenterId: center._id,
      cohesionCenterName: center.name,
      cohesionCenterCity: center.city,
      cohesionCenterZip: center.zip,
    });
    await young.save();
    await young.index();

    center.waitingList.push(young._id);
    await center.save();

    return res.status(200).send({ data: center, ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await CohesionCenterModel.findById(req.params.id);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/head", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const center = await CohesionCenterModel.findById(req.params.id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await ReferentModel.findOne({ role: "head_center", cohesionCenterId: center._id });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await CohesionCenterModel.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});
router.get("/young/:youngId", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.params.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(404).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const center = await CohesionCenterModel.findByIdAndUpdate(req.body._id, req.body, { new: true });
    const data = await updatePlacesCenter(center);
    res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const center = await CohesionCenterModel.findOne({ _id: req.params.id });
    if (req.user.role !== "admin") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    await center.remove();
    console.log(`Center ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/certificate", passport.authenticate("referent", { session: false }), async (req, res) => {
  const youngs = await YoungModel.find({ cohesionCenterId: req.params.id, cohesionStayPresence: "true" });

  const getLocationCohesionCenter = (y) => {
    let t = "";
    if (y.cohestionCenterCity) {
      t = `à ${y.cohestionCenterCity}`;
      if (y.cohestionCenterZip) {
        t += `, ${y.cohestionCenterZip}`;
      }
    }
    return t;
  };

  const getBaseUrl = () => {
    if (config.ENVIRONMENT === "staging") return "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
    if (config.ENVIRONMENT === "production") return "https://app-5a3e097d-fdf1-44fa-9172-88ad9d7b2b20.cleverapps.io";
    return "http://localhost:8080";
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
  const COHESION_CENTER_LOCATION = youngs[0] ? getLocationCohesionCenter(youngs[0]) : "";
  const data = [];
  for (const young of youngs) {
    data.push(
      subHtml
        .replace(/{{FIRST_NAME}}/g, young.firstName)
        .replace(/{{LAST_NAME}}/g, young.lastName)
        .replace(/{{COHORT}}/g, young.cohort)
        .replace(/{{COHESION_CENTER_NAME}}/g, young.cohesionCenterName || "")
        .replace(/{{COHESION_CENTER_LOCATION}}/g, COHESION_CENTER_LOCATION)
        .replace(/{{GENERAL_BG}}/g, template)
        .replace(/{{DATE}}/g, d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }))
    );
  }

  const newhtml = html.replace(/{{BASE_URL}}/g, getBaseUrl()).replace(/{{BODY}}/g, data.join(""));

  const buffer = await renderFromHtml(newhtml, req.body.options || { format: "A4", margin: 0 });

  res.contentType("application/pdf");
  res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
  res.set("Cache-Control", "public, max-age=1");
  res.send(buffer);
});

module.exports = router;
