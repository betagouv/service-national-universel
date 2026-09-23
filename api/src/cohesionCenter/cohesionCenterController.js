const express = require("express");
const router = express.Router();
const passport = require("passport");

const { ROLES } = require("snu-lib");

const { capture } = require("../sentry");
const { YoungModel, CohesionCenterModel, CohortModel, SessionPhase1Model } = require("../models");
const { ERRORS, isYoung } = require("../utils");
const Joi = require("joi");
const { serializeCohesionCenter, serializeSessionPhase1 } = require("../utils/serializer");
const { validateId } = require("../utils/validator");
const { getCohortIdsFromCohortName } = require("../cohort/cohortService");
const { canViewSejourHistory, getCohesionCenterScopeFilter, isCohesionCenterDocInUserScope } = require("../services/sejourAccess");

// Périmètre des centres de cohésion (lot K2 : M10, M11, L6).
// Les centres sont importés du SI-SNU : `POST /`, `PUT /:id` (qui propageait adresse, département et
// région aux jeunes, sessions et plans de transport) et `POST /export-presence` (statistiques
// nationales sans contrôle de rôle ni borne) ont été supprimées, aucun front ne les appelait.
// Les routes restantes sont réservées à l'administrateur et aux référents départementaux /
// régionaux, dans leur territoire (même périmètre que les sessions, `services/sejourAccess.ts`).
// Tout autre rôle — transporteur, rôles CLE, chefs de centre — est refusé (fail-closed).

router.put("/:id/session-phase1", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: cohesionCenterId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canViewSejourHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      placesTotal: Joi.number().required(),
      email: Joi.string().email().allow(null, ""),
    }).validate({ ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const center = await CohesionCenterModel.findById(cohesionCenterId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!isCohesionCenterDocInUserScope(req.user, center)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    // check if session doesnt already exist
    if (center.cohorts.includes(value.cohort)) return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });

    if (value.placesTotal > center.placesTotal) value.placesTotal = center.placesTotal;

    const newCohorts = center.cohorts;
    newCohorts.push(value.cohort);

    const cohort = await CohortModel.findOne({ name: value.cohort });

    const session = await SessionPhase1Model.create({
      cohesionCenterId,
      cohort: value.cohort,
      placesTotal: value.placesTotal,
      placesLeft: value.placesTotal,
      department: center.department,
      region: center.region,
      codeCentre: center.matricule,
      nameCentre: center.name,
      cityCentre: center.city,
      zipCentre: center.zip,
      sanitaryContactEmail: value.email,
      cohortId: cohort?._id,
    });
    const cohortIds = await getCohortIdsFromCohortName(newCohorts);
    center.set({ cohorts: newCohorts, cohortIds: cohortIds });
    await center.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeSessionPhase1(session, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewSejourHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await CohesionCenterModel.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!isCohesionCenterDocInUserScope(req.user, data)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    return res.status(200).send({ ok: true, data: serializeCohesionCenter(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/cohort/:cohort/session-phase1", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: id } = validateId(req.params.id);
    const { error, value: cohort } = Joi.string().required().validate(req.params.cohort);
    if (errorId || error) {
      capture(errorId || error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewSejourHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const center = await CohesionCenterModel.findById(id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!isCohesionCenterDocInUserScope(req.user, center)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const sessionPhase1 = await SessionPhase1Model.findOne({ cohesionCenterId: center._id, cohort });
    if (!sessionPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeSessionPhase1(sessionPhase1, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/session-phase1", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewSejourHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const center = await CohesionCenterModel.findById(id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!isCohesionCenterDocInUserScope(req.user, center)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const sessionsPhase1 = await SessionPhase1Model.find({ cohesionCenterId: center._id });
    if (!sessionsPhase1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: sessionsPhase1.map((session) => serializeSessionPhase1(session, req.user)) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const filter = getCohesionCenterScopeFilter(req.user);
    if (!filter) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await CohesionCenterModel.find(filter);
    return res.status(200).send({ ok: true, data: data.map((center) => serializeCohesionCenter(center, req.user)) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/young/:youngId", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.youngId);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && req.user._id.toString() !== id) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    return res.status(200).send({ ok: true, data: serializeCohesionCenter(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * @deprecated center is now imported from SI-SNU
 */
//TODO: remove this route
router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (req.user.role !== ROLES.ADMIN) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const center = await CohesionCenterModel.findById(id);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (center.deletedAt) {
      return res.status(400).send({ ok: false, code: ERRORS.ALREADY_DELETED, message: "Center is already deleted" });
    }

    const sessionsPhase1 = await SessionPhase1Model.find({ cohesionCenterId: center._id });
    if (sessionsPhase1.length !== 0) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    center.deletedAt = new Date();
    await center.save({ fromUser: req.user });
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
