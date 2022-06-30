const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const CohesionCenterModel = require("../models/cohesionCenter");
const SessionPhase1 = require("../models/sessionPhase1");
const ReferentModel = require("../models/referent");
const YoungModel = require("../models/young");
const MeetingPointObject = require("../models/meetingPoint");
const BusObject = require("../models/bus");
const {
  ERRORS,
  updatePlacesCenter,
  updatePlacesBus,
  sendAutoCancelMeetingPoint,
  getSignedUrl,
  updateCenterDependencies,
  deleteCenterDependencies,
  isYoung,
  getBaseUrl,
  sanitizeAll,
  YOUNG_STATUS,
} = require("../utils");
const renderFromHtml = require("../htmlToPdf");
const { ROLES, canCreateOrUpdateCohesionCenter, canViewCohesionCenter, canAssignCohesionCenter, canSearchSessionPhase1 } = require("snu-lib/roles");
const Joi = require("joi");
const { serializeCohesionCenter, serializeYoung, serializeReferent, serializeSessionPhase1 } = require("../utils/serializer");
const { validateNewCohesionCenter, validateUpdateCohesionCenter, validateId } = require("../utils/validator");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateNewCohesionCenter(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canCreateOrUpdateCohesionCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const cohesionCenter = await CohesionCenterModel.create(value);

    // create sessionPhase1 documents linked to this cohesion center
    if (cohesionCenter.cohorts.length > 0) {
      for (let cohort of cohesionCenter.cohorts) {
        const cohesionCenterId = cohesionCenter._id;
        const placesTotal = value[cohort].placesTotal;
        const placesLeft = value[cohort].placesLeft;
        const status = value[cohort].status;
        await SessionPhase1.create({ cohesionCenterId, cohort, placesTotal, placesLeft, status });
      }
    }

    return res.status(200).send({ ok: true, data: serializeCohesionCenter(cohesionCenter) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:centerId/assign-young/:youngId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ youngId: Joi.string().required(), centerId: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { youngId, centerId } = value;
    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canAssignCohesionCenter(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const center = await CohesionCenterModel.findById(centerId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (center.placesLeft <= 0) return res.status(404).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    const oldCenter = young.cohesionCenterId ? await CohesionCenterModel.findById(young.cohesionCenterId) : null;

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

    await young.save({ fromUser: req.user });

    //if young is in waitingList of the center
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
    if (bus) await updatePlacesBus(bus);

    return res.status(200).send({
      data: serializeCohesionCenter(center, req.user),
      young: serializeYoung(young, req.user),
      ok: true,
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.post("/:centerId/assign-young-waiting-list/:youngId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ youngId: Joi.string().required(), centerId: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { youngId, centerId } = value;
    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canAssignCohesionCenter(req.user, young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const center = await CohesionCenterModel.findById(centerId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // update youngs infos
    young.set({
      statusPhase1: "WAITING_LIST",
      cohesionCenterId: center._id,
      cohesionCenterName: center.name,
      cohesionCenterCity: center.city,
      cohesionCenterZip: center.zip,
    });
    await young.save({ fromUser: req.user });

    center.waitingList.push(young._id);
    await center.save();

    return res.status(200).send({ data: serializeCohesionCenter(center), ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewCohesionCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await CohesionCenterModel.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeCohesionCenter(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/cohort/:cohort/session-phase1", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required(), cohort: Joi.string().required() }).unknown().validate(req.params);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewCohesionCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const center = await CohesionCenterModel.findById(value.id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessionPhase1 = await SessionPhase1.findOne({ cohesionCenterId: center._id, cohort: value.cohort });
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(sessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/cohort/:cohort/stats", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  const { error, value } = Joi.object({ id: Joi.string().required(), cohort: Joi.string().required() }).unknown().validate(req.params);
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

  if (!canSearchSessionPhase1(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

  try {
    const center = await CohesionCenterModel.findById(value.id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessionPhase1 = await SessionPhase1.findOne({ cohesionCenterId: center._id, cohort: value.cohort });
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const youngs = await YoungModel.find({ status: YOUNG_STATUS.VALIDATED, sessionPhase1Id: sessionPhase1._id });

    return res.status(200).send({ ok: true, data: { youngs, sessionPhase1 } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// todo : optimiser - ca ne scale pas
router.post("/export-presence", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      region: Joi.array().items(Joi.string().allow(null, "")),
      department: Joi.array().items(Joi.string().allow(null, "")),
      code2022: Joi.array().items(Joi.string().allow(null, "")),
      cohorts: Joi.array().items(Joi.string().allow(null, "")),
    }).validate({ ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const filterCenter = {};
    if (value.region?.length) filterCenter.region = { $in: value.region };
    if (value.department?.length) filterCenter.department = { $in: value.department };
    if (value.code2022?.length) filterCenter.code2022 = { $in: value.code2022 };
    if (value.cohorts?.length) filterCenter.cohorts = { $in: value.cohorts };

    const allSessionsPhase1 = await SessionPhase1.find();
    const cursorCenters = await CohesionCenterModel.find(filterCenter).cursor();

    let result = [];

    await cursorCenters.eachAsync(async function (center) {
      const sessionsPhase1 = allSessionsPhase1
        .filter((session) => session.cohesionCenterId === center._id.toString())
        .filter((session) => value.cohorts?.length === 0 || value.cohorts?.includes(session.cohort));
      if (!sessionsPhase1 || sessionsPhase1.length === 0) return;

      for (let sessionPhase1 of sessionsPhase1) {
        const youngs = await YoungModel.find({ status: YOUNG_STATUS.VALIDATED, sessionPhase1Id: sessionPhase1._id });
        const stats = (youngs || []).reduce(
          (previous, young) => {
            if (young.cohesionStayPresence === "true") previous.presenceArrive++;
            if (young.cohesionStayPresence === "false") previous.absenceArrive++;
            if (!young.cohesionStayPresence) previous.nonRenseigneArrive++;
            if (young.departSejourAt) previous.depart++;
            if (young.presenceJDM === "true") previous.presenceJDM++;
            if (young.presenceJDM === "false") previous.absenceJDM++;
            if (!young.presenceJDM) previous.nonRenseigneJDM++;
            if (young.departSejourMotif === "Exclusion") previous.departSejourMotif_exclusion++;
            if (young.departSejourMotif === "Cas de force majeure pour le volontaire") previous.departSejourMotif_forcemajeure++;
            if (young.departSejourMotif === "Annulation du séjour ou mesure d’éviction sanitaire") previous.departSejourMotif_sanitaire++;
            if (young.departSejourMotif === "Autre") previous.departSejourMotif_autre++;
            return previous;
          },
          {
            presenceArrive: 0,
            absenceArrive: 0,
            nonRenseigneArrive: 0,
            depart: 0,
            presenceJDM: 0,
            absenceJDM: 0,
            nonRenseigneJDM: 0,
            departSejourMotif_exclusion: 0,
            departSejourMotif_forcemajeure: 0,
            departSejourMotif_sanitaire: 0,
            departSejourMotif_autre: 0,
          },
        );

        const pourcentageRemplissage = ((((sessionPhase1.placesTotal || 0) - (sessionPhase1.placesLeft || 0)) * 100) / (sessionPhase1.placesTotal || 1)).toFixed(2);
        result.push({
          "Nom du centre": center.name,
          "ID du centre": center._id.toString(),
          "Code du centre": center.code2022 || "",
          "Région du centre": center.region,
          // "Académie du centre": center.academy,
          "Département du centre": center.department,
          Cohorte: sessionPhase1.cohort,
          "Nombre de volontaires affectés (validés)": youngs.length,
          "% de remplissage": pourcentageRemplissage,
          "Nombre de présents à l’arrivée": stats.presenceArrive,
          "Nombre d’absents à l’arrivée": stats.absenceArrive,
          "Nombre de présence non renseignée": stats.nonRenseigneArrive,
          "Nombre de départ": stats.depart,
          // 'Nombre de motif "abandon"': "",
          'Nombre de motif "exclusion"': stats.departSejourMotif_exclusion,
          'Nombre de motif "cas de force majeur"': stats.departSejourMotif_forcemajeure,
          'Nombre de motif "Annulation séjour/éviction sanitaire"': stats.departSejourMotif_sanitaire,
          'Nombre de motif "autre"': stats.departSejourMotif_autre,
          "Nombre de présent à la JDM": stats.presenceJDM,
          "Nombre d’absent à la JDM": stats.absenceJDM,
          "Nombre de présence non renseigné à la JDM": stats.nonRenseigneJDM,
        });
      }
    });

    res.status(200).send({ ok: true, data: result });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/session-phase1", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() }).unknown().validate(req.params);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewCohesionCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const center = await CohesionCenterModel.findById(value.id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessionsPhase1 = await SessionPhase1.find({ cohesionCenterId: center._id });
    if (!sessionsPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: sessionsPhase1.map(serializeSessionPhase1) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  if (!canViewCohesionCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  try {
    const data = await CohesionCenterModel.find({});
    return res.status(200).send({ ok: true, data: data.map(serializeCohesionCenter) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.get("/young/:youngId", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.youngId);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && req.user._id.toString() !== id) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    return res.status(200).send({ ok: true, data: serializeCohesionCenter(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canCreateOrUpdateCohesionCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error, value: newCenter } = validateUpdateCohesionCenter(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const center = await CohesionCenterModel.findById(checkedId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const previousCohorts = center.cohorts || [];
    center.set(newCenter);
    await center.save();

    // if we change the cohorts, we need to update the sessionPhase1
    if (newCenter?.cohorts?.length) {
      const deletedCohorts = previousCohorts.filter((cohort) => !newCenter.cohorts.includes(cohort));
      // add sessionPhase1 documents linked to this cohesion center

      for (let cohort of center.cohorts) {
        if (!deletedCohorts.includes(cohort)) {
          const cohesionCenterId = center._id;
          const placesTotal = newCenter[cohort].placesTotal;
          const placesLeft = newCenter[cohort].placesLeft;
          const status = newCenter[cohort].status;
          const session = await SessionPhase1.findOne({ cohesionCenterId, cohort });
          if (session) {
            session.set({ placesTotal, placesLeft, status });
            await session.save();
          } else {
            await SessionPhase1.create({ cohesionCenterId, cohort, placesTotal, placesLeft, status });
          }
        }
      }

      // ! MAYBE DANGEROUS ?
      // delete sessionPhase1 documents linked to this cohesion center
      if (deletedCohorts?.length > 0) {
        for (let cohort of deletedCohorts) {
          const sessionPhase1 = await SessionPhase1.findOne({ cohesionCenterId: center._id, cohort });
          const youngsInSessions = await YoungModel.find({ sessionPhase1Id: sessionPhase1._id.toString() });
          if (youngsInSessions.length === 0) {
            await sessionPhase1?.remove();
          }
        }
      }
    }

    await updateCenterDependencies(center);

    res.status(200).send({ ok: true, data: serializeCohesionCenter(center) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = Joi.string().required().validate(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canCreateOrUpdateCohesionCenter(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const center = await CohesionCenterModel.findById(id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessionsPhase1 = await SessionPhase1.find({ cohesionCenterId: center._id });

    const youngsInSessions = await YoungModel.find({ sessionPhase1Id: sessionsPhase1.map((session) => session._id.toString()) });

    if (youngsInSessions.length) return res.status(409).send({ ok: false, code: ERRORS.LINKED_OBJECT });

    await center.remove();
    await deleteCenterDependencies({ _id: id });
    for (let sessionPhase1 of sessionsPhase1) {
      await sessionPhase1.remove();
    }
    console.log(`Center ${id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
