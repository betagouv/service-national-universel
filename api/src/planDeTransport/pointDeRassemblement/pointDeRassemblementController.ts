import express from "express";
import passport from "passport";
import Joi from "joi";

import { PointDeRassemblementModel, SchemaDeRepartitionModel, LigneBusModel, YoungModel, LigneToPointModel } from "../../models";
import { canViewMeetingPoints } from "snu-lib";
import { ERRORS, isYoung } from "../../utils";
import { capture } from "../../sentry";
import { validateId } from "../../utils/validator";
import { getCohesionCenterFromSession } from "../../controllers/planDeTransport/commons";
import { UserRequest } from "../../controllers/request";
import { isCohesionCenterInUserScope, isPointDeRassemblementInUserScope, serializeLigneBus, serializeLigneBusList } from "../../services/sejourAccess";

const router = express.Router();

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Récupère les points de rassemblements (avec horaire de passage) pour un jeune affecté.
 */
router.get("/available", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    // verify cohesion center
    let cohesionCenter = req.user.sessionPhase1Id ? await getCohesionCenterFromSession(req.user.sessionPhase1Id) : null;
    if (!cohesionCenter) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // We need to get all the meetingPoints that:
    // - are in a young's department
    // - are in a bus line that is affected to the young's session
    // - are in a bus line that still has available seats

    const meetingPointsInSameDepartment = await PointDeRassemblementModel.find({ department: req.user.department, deletedAt: { $exists: false } });

    // get all buses to cohesion center using previous meeting points, find used meeting points with hours and get a new meeting point list
    let meetingPointIds = meetingPointsInSameDepartment.map((m) => m._id.toString());
    // on ajoute le PDR choisi par le jeune pour être certain qu'il soit à l'arrivée.
    if (req.user.meetingPointId) {
      meetingPointIds.push(req.user.meetingPointId);
    }
    const meetingPoints = await LigneToPointModel.aggregate([
      { $match: { meetingPointId: { $in: meetingPointIds } } },
      {
        $addFields: { lineId: { $toObjectId: "$lineId" } },
      },
      {
        $lookup: {
          from: "lignebuses",
          localField: "lineId",
          foreignField: "_id",
          as: "lignebus",
        },
      },
      { $unwind: "$lignebus" },
      { $match: { "lignebus.cohort": req.user.cohort, "lignebus.centerId": cohesionCenter._id.toString() } },
      {
        $addFields: { meetingPointId: { $toObjectId: "$meetingPointId" } },
      },
      {
        $lookup: {
          from: "pointderassemblements",
          localField: "meetingPointId",
          foreignField: "_id",
          as: "pdr",
        },
      },
      { $unwind: "$pdr" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$pdr",
              {
                meetingHour: "$meetingHour",
                returnHour: "$returnHour",
                busLineId: "$lignebus._id",
                busLineName: "$lignebus.busId",
                youngSeatsTaken: "$lignebus.youngSeatsTaken",
                youngCapacity: "$lignebus.youngCapacity",
                departuredDate: "$lignebus.departuredDate",
                returnDate: "$lignebus.returnDate",
              },
            ],
          },
        },
      },
    ]);

    // on ne garde que les bus avec de la place restante.
    const availableMeetingPoints = meetingPoints.filter((mp) => {
      if (req.user.meetingPointId) {
        return mp.youngSeatsTaken < mp.youngCapacity || req.user.meetingPointId === mp._id.toString();
      } else {
        return mp.youngSeatsTaken < mp.youngCapacity;
      }
    });

    // return meeting points
    return res.status(200).send({ ok: true, data: availableMeetingPoints });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Récupère les points de rassemblements pour un centre de cohésion avec cohort
 */
router.get("/center/:centerId/cohort/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      centerId: Joi.string().required(),
      cohort: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { centerId, cohort } = value;

    // `canViewMeetingPoints` ne teste que le rôle : un référent de classe ou un chef de centre
    // quelconque listait les lignes et les accompagnateurs de n'importe quel centre de France.
    if (!(await isCohesionCenterInUserScope(req.user, centerId))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    const ligneBus = await LigneBusModel.find({ cohort: cohort, centerId: centerId });

    let arrayMeetingPoints = [];
    ligneBus.map((l) => (arrayMeetingPoints = arrayMeetingPoints.concat(l.meetingPointsIds as any)));

    const meetingPoints = await PointDeRassemblementModel.find({ _id: { $in: arrayMeetingPoints } });

    return res.status(200).send({ ok: true, data: { meetingPoints, ligneBus: serializeLigneBusList(ligneBus, req.user) } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);

    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewMeetingPoints(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // on récupère aussi les deletedAt pour permettre l'affichage de l'historique
    const data = await PointDeRassemblementModel.findOne({ _id: checkedId });

    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// get 1 meetingPoint info with meetingPoint Id and Bus Id as params
router.get("/fullInfo/:pdrId/:busId", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: errorParams, value: valueParams } = Joi.object({ pdrId: Joi.string().required(), busId: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { pdrId, busId } = valueParams;

    // young can only get his own meetingPoint info
    if (isYoung(req.user)) {
      const young = await YoungModel.findById(req.user._id);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (young.meetingPointId !== pdrId || young.ligneId !== busId) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const pointDeRassemblement = await PointDeRassemblementModel.findById(pdrId);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // La branche référent n'avait aucun contrôle : tout compte référent lisait n'importe quelle ligne.
    if (!isYoung(req.user) && !isPointDeRassemblementInUserScope(req.user, pointDeRassemblement)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const bus = await LigneBusModel.findById(busId);
    if (!bus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const ligneToPoint = await LigneToPointModel.findOne({ meetingPointId: pdrId, lineId: busId });
    if (!ligneToPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // `team` = état civil, date de naissance, email et téléphone des accompagnateurs : jamais pour un jeune.
    return res.status(200).send({ ok: true, data: { pointDeRassemblement, bus: serializeLigneBus(bus, req.user), ligneToPoint } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// get all available meetingPoints with cohort and centerId as params
router.get("/ligneToPoint/:cohort/:centerId", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    // --- parameters & vérification
    const { error: errorParams, value: valueParams } = Joi.object({ cohort: Joi.string().required(), centerId: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { cohort, centerId } = valueParams;

    const { error: errorQuery, value: valueQuery } = Joi.object({
      filter: Joi.string().trim().allow("", null),
    }).validate(req.query, {
      stripUnknown: true,
    });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { filter } = valueQuery;

    // Cette route n'avait aucun contrôle au-delà de l'authentification référent.
    if (!(await isCohesionCenterInUserScope(req.user, centerId))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // `filter` était injecté tel quel dans un RegExp évalué par Mongo (ReDoS).
    const regex = new RegExp(".*" + escapeRegex(filter || "") + ".*", "i");

    const ligneDeBus = await LigneBusModel.find({ cohort: cohort, centerId: centerId });
    const ligneToPoint = await LigneToPointModel.find({ lineId: { $in: ligneDeBus.map((l) => l._id) } });

    const meetingPointIds = ligneToPoint.map((l) => l.meetingPointId.toString());
    const meetingPoints = await PointDeRassemblementModel.find({
      _id: { $in: meetingPointIds },
      $or: [{ name: { $regex: regex } }, { city: { $regex: regex } }, { department: { $regex: regex } }, { region: { $regex: regex } }],
    });

    //build final Array since client wait for ligneToPoint + meetingPoint + ligneBus
    const data: any[] = [];
    ligneToPoint.map((ligne) => {
      const meetingPointFiltered = meetingPoints.find((m) => m._id.toString() === ligne.meetingPointId);
      const ligneBusFiltered = ligneDeBus.find((l) => l._id.toString() === ligne.lineId);

      // filter uniquement sur les bus avec des places dispos
      if (meetingPointFiltered && ligneBusFiltered && ligneBusFiltered.youngSeatsTaken < ligneBusFiltered.youngCapacity)
        data.push({ meetingPoint: meetingPointFiltered, ligneToPoint: ligne, ligneBus: serializeLigneBus(ligneBusFiltered, req.user) });
    });

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/bus/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    const { error: errorCohort, value: checkedCohort } = Joi.string().required().validate(req.params.cohort);

    if (errorId || errorCohort) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const data = await PointDeRassemblementModel.findOne({ _id: checkedId });

    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // Périmètre du point de rassemblement, au lieu du seul contrôle de rôle `canViewMeetingPoints`.
    if (!isPointDeRassemblementInUserScope(req.user, data)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const lignes = await LigneBusModel.find({ cohort: checkedCohort, meetingPointsIds: checkedId });
    if (!lignes.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const meetingPointsDetail = await LigneToPointModel.find({ lineId: { $in: lignes.map((l) => l._id) }, meetingPointId: checkedId });

    return res.status(200).send({ ok: true, data: { bus: serializeLigneBusList(lignes, req.user), meetingPoint: data, meetingPointsDetail } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

//check if meetingPoint is in a schema
router.get("/:id/in-schema", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    // --- vérification
    const { error: errorParams, value: valueParams } = Joi.object({ id: Joi.string().required() }).validate(req.params, {
      stripUnknown: true,
    });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { id } = valueParams;

    if (!canViewMeetingPoints(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- update
    const schema = await SchemaDeRepartitionModel.findOne({ gatheringPlaces: id });

    // --- résultat
    // noinspection RedundantConditionalExpressionJS
    return res.status(200).send({ ok: true, data: schema ? true : false });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
