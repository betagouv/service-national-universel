import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";
import mongoose from "mongoose";
import { config } from "../../config";
import {
  canViewLigneBus,
  canEditLigneBusTeam,
  canEditLigneBusGeneralInfo,
  canEditLigneBusPointDeRassemblement,
  isBusEditionOpen,
  ROLES,
  canViewPatchesHistory,
  formatStringLongDate,
  isIsoDate,
  translateBusPatchesField,
  canExportConvoyeur,
  isAdmin,
  SENDINBLUE_TEMPLATES,
  isTeamLeaderOrSupervisorEditable,
  hasPermission,
  ACTIONS,
} from "snu-lib";
import {
  LigneBusModel,
  LigneToPointModel,
  PlanTransportModel,
  PointDeRassemblementModel,
  CohesionCenterModel,
  SchemaDeRepartitionModel,
  ReferentModel,
  CohortModel,
  SessionPhase1Model,
} from "../../models";
import { capture } from "../../sentry";
import { sendTemplate } from "../../brevo";
import { ERRORS } from "../../utils";
import { validateId } from "../../utils/validator";
import { UserRequest } from "../../controllers/request";
import { getInfoBus, updatePDRForLine, updateSessionForLine } from "./ligneDeBusService";
import { notifyTransporteurLineWasUpdated } from "./ligneDeBusNotificationService";

const router = express.Router();

/**
 * Récupère toutes les ligneBus +  les points de rassemblemnts associés
 */
router.get("/all", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const ligneBus = await LigneBusModel.find({ deletedAt: { $exists: false } });
    let arrayMeetingPoints = [];
    // @ts-ignore
    ligneBus.map((l) => (arrayMeetingPoints = arrayMeetingPoints.concat(l.meetingPointsIds)));
    const meetingPoints = await PointDeRassemblementModel.find({ _id: { $in: arrayMeetingPoints }, deletedAt: { $exists: false } });
    const ligneToPoints = await LigneToPointModel.find({ lineId: { $in: ligneBus.map((l) => l._id) } });
    return res.status(200).send({ ok: true, data: { ligneBus, meetingPoints, ligneToPoints } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

//Récupère toutes les ligneBus + les centres associés

router.get("/cohort/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
    }).validate(req.params);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canExportConvoyeur(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { cohort } = value;

    const ligneBus = await LigneBusModel.find({ cohort: { $in: [cohort] }, deletedAt: { $exists: false } });
    let arrayCenter = [];
    // @ts-ignore
    ligneBus.map((l) => (arrayCenter = arrayCenter.concat(l.centerId)));
    const centers = await CohesionCenterModel.find({ _id: { $in: arrayCenter } });
    return res.status(200).send({ ok: true, data: { ligneBus, centers } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/info", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      busId: Joi.string().required(),
      departuredDate: Joi.date().required(),
      returnDate: Joi.date().required(),
      youngCapacity: Joi.number().required(),
      totalCapacity: Joi.number().required(),
      followerCapacity: Joi.number().required(),
      travelTime: Joi.string().required(),
      lunchBreak: Joi.boolean().required(),
      lunchBreakReturn: Joi.boolean().required(),
      delayedForth: Joi.string(),
      delayedBack: Joi.string(),
    }).validate({ ...req.params, ...req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    let { id, busId, departuredDate, returnDate, youngCapacity, totalCapacity, followerCapacity, travelTime, lunchBreak, lunchBreakReturn, delayedForth, delayedBack } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const cohort = await CohortModel.find({ name: ligne.cohort });
    if (!cohort.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (req.user.role === ROLES.TRANSPORTER) {
      if (!isBusEditionOpen(req.user, cohort[0])) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    } else {
      if (!canEditLigneBusGeneralInfo(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    youngCapacity = parseInt(youngCapacity);
    totalCapacity = parseInt(totalCapacity);
    followerCapacity = parseInt(followerCapacity);

    if (totalCapacity < youngCapacity + followerCapacity) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const planDeTransport = await PlanTransportModel.findById(id);
    if (!planDeTransport) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    //add some checks

    ligne.set({
      busId,
      departuredDate,
      returnDate,
      youngCapacity,
      totalCapacity,
      followerCapacity,
      travelTime,
      lunchBreak,
      lunchBreakReturn,
      delayedForth,
      delayedBack,
    });

    await ligne.save({ fromUser: req.user });

    // * Update slave PlanTransport
    // ! Gerer logique si il y a deja des inscrits
    planDeTransport.set({
      busId,
      departureString: departuredDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      returnString: returnDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      lineFillingRate: youngCapacity && Math.floor((planDeTransport.youngSeatsTaken / youngCapacity) * 100),
      youngCapacity,
      totalCapacity,
      followerCapacity,
      travelTime,
      lunchBreak,
      lunchBreakReturn,
      delayedForth,
      delayedBack,
    });
    await planDeTransport.save({ fromUser: req.user });
    // * End update slave PlanTransport

    const infoBus = await getInfoBus(ligne);

    await notifyTransporteurLineWasUpdated(ligne, "Informations générales");

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/team", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      role: Joi.string().required(),
      idTeam: Joi.string(),
      lastname: Joi.string().required(),
      firstname: Joi.string().required(),
      birthdate: Joi.date().required(),
      phone: Joi.string().required(),
      mail: Joi.string().required(),
      forth: Joi.boolean().required(),
      back: Joi.boolean().required(),
    }).validate({ ...req.params, ...req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const ligne = await LigneBusModel.findById(value.id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const cohort = await CohortModel.find({ name: ligne.cohort });
    if (!cohort.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (req.user.role === ROLES.TRANSPORTER) {
      if (!isBusEditionOpen(req.user, cohort[0])) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    } else {
      if (!canEditLigneBusTeam(req.user) && !isTeamLeaderOrSupervisorEditable(req.user, cohort[0])) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const NewMember = {
      role: value.role,
      lastName: value.lastname,
      firstName: value.firstname,
      birthdate: value.birthdate,
      phone: value.phone,
      mail: value.mail,
      forth: value.forth,
      back: value.back,
    };

    const memberToDelete = ligne.team.id(value.idTeam);
    if (!memberToDelete) {
      ligne.team.push(NewMember);
    } else {
      memberToDelete.set({
        role: value.role,
        lastName: value.lastname,
        firstName: value.firstname,
        birthdate: value.birthdate,
        phone: value.phone,
        mail: value.mail,
        forth: value.forth,
        back: value.back,
      });
    }
    await ligne.save({ fromUser: req.user });

    const infoBus = await getInfoBus(ligne);

    await notifyTransporteurLineWasUpdated(ligne, "Équipe");

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/teamDelete", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      idTeam: Joi.string().required(),
      role: Joi.string().required(),
      lastname: Joi.string().required(),
      firstname: Joi.string().required(),
      birthdate: Joi.date().required(),
      phone: Joi.string().required(),
      mail: Joi.string().required(),
      forth: Joi.boolean().required(),
      back: Joi.boolean().required(),
    }).validate({ ...req.params, ...req.body });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const ligne = await LigneBusModel.findById(value.id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const cohort = await CohortModel.find({ name: ligne.cohort });
    if (!cohort.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (req.user.role === ROLES.TRANSPORTER) {
      if (!isBusEditionOpen(req.user, cohort[0])) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    } else {
      if (!canEditLigneBusTeam(req.user) && !isTeamLeaderOrSupervisorEditable(req.user, cohort[0])) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const memberToDelete = ligne.team.id(value.idTeam);
    if (!memberToDelete) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await memberToDelete.deleteOne();
    await ligne.save({ fromUser: req.user });

    const infoBus = await getInfoBus(ligne);

    await notifyTransporteurLineWasUpdated(ligne, "Équipe");

    res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/centre", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      centerArrivalTime: Joi.string().required(),
      centerDepartureTime: Joi.string().required(),
      sessionId: Joi.string(),
      sendCampaign: Joi.boolean(),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    let { id, centerArrivalTime, centerDepartureTime, sessionId, sendCampaign } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const cohort = await CohortModel.findOne({ name: ligne.cohort });
    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessionHasChanged = sessionId && sessionId !== ligne.sessionId;
    const scheduleHasChanged = (centerArrivalTime && centerArrivalTime !== ligne.centerArrivalTime) || (centerDepartureTime && centerDepartureTime !== ligne.centerDepartureTime);

    const canUpdateSessionId = hasPermission(req.user, ACTIONS.TRANSPORT.UPDATE_SESSION_ID, { cohort });
    const canUpdateCenterSchedule = hasPermission(req.user, ACTIONS.TRANSPORT.UPDATE_CENTER_SCHEDULE, { cohort });
    const canSendNotifications = hasPermission(req.user, ACTIONS.TRANSPORT.SEND_NOTIFICATION, { cohort });

    if ((sessionHasChanged && !canUpdateSessionId) || (scheduleHasChanged && !canUpdateCenterSchedule) || (sendCampaign && !canSendNotifications)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (scheduleHasChanged) {
      ligne.set({
        centerArrivalTime,
        centerDepartureTime,
      });

      await ligne.save({ fromUser: req.user });

      const planDeTransport = await PlanTransportModel.findById(id);
      if (!planDeTransport) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }
      planDeTransport.set({
        centerArrivalTime,
        centerDepartureTime,
      });

      await planDeTransport.save({ fromUser: req.user });
    }

    if (sessionHasChanged) {
      const session = await SessionPhase1Model.findById(sessionId);
      if (!session) throw new Error(ERRORS.NOT_FOUND);
      await updateSessionForLine({
        ligne,
        session,
        user: req.user,
        sendCampaign,
      });
    }

    const infoBus = await getInfoBus(ligne);

    await notifyTransporteurLineWasUpdated(ligne, "Centre de cohésion");

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/pointDeRassemblement", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      transportType: Joi.string().required(),
      meetingHour: Joi.string().required(),
      busArrivalHour: Joi.string().required(),
      departureHour: Joi.string().required(),
      returnHour: Joi.string().required(),
      meetingPointId: Joi.string().required(),
      newMeetingPointId: Joi.string().required(),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    const { id, transportType, meetingHour, busArrivalHour, departureHour, returnHour, meetingPointId, newMeetingPointId } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const cohort = await CohortModel.find({ name: ligne.cohort });
    if (!cohort.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (req.user.role === ROLES.TRANSPORTER) {
      if (!isBusEditionOpen(req.user, cohort[0])) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    } else {
      if (!canEditLigneBusPointDeRassemblement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const ligneToPoint = await LigneToPointModel.findOne({ lineId: id, meetingPointId });
    if (!ligneToPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if ([ROLES.ADMIN, ROLES.TRANSPORTER].includes(req.user.role)) {
      ligneToPoint.set({
        transportType,
        meetingHour,
        busArrivalHour,
        departureHour,
        returnHour,
        ...(meetingPointId !== newMeetingPointId && { meetingPointId: newMeetingPointId }),
      });

      await ligneToPoint.save({ fromUser: req.user });

      if (meetingPointId !== newMeetingPointId) {
        const meetingPointsIds = ligne.meetingPointsIds.filter((id) => id !== meetingPointId);
        meetingPointsIds.push(newMeetingPointId);
        ligne.set({ meetingPointsIds });
        await ligne.save({ fromUser: req.user });
      }
    } else {
      ligneToPoint.set({
        transportType,
        meetingHour,
      });
      await ligneToPoint.save({ fromUser: req.user });
    }

    // * Update slave PlanTransport
    const planDeTransport = await PlanTransportModel.findById(id);
    if (!planDeTransport) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const pointDeRassemblement = await PointDeRassemblementModel.findById(new mongoose.Types.ObjectId(newMeetingPointId));
    if (!pointDeRassemblement) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const meetingPoint = planDeTransport.pointDeRassemblements.find((meetingPoint) => {
      return meetingPoint.meetingPointId === meetingPointId;
    });
    if (!meetingPoint) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    meetingPoint.set({
      meetingPointId: newMeetingPointId,
      ...pointDeRassemblement._doc,
      busArrivalHour: ligneToPoint.busArrivalHour,
      meetingHour: ligneToPoint.meetingHour,
      departureHour: ligneToPoint.departureHour,
      returnHour: ligneToPoint.returnHour,
      transportType: ligneToPoint.transportType,
    });

    await planDeTransport.save({ fromUser: req.user });
    // * End update slave PlanTransport

    const infoBus = await getInfoBus(ligne);

    await notifyTransporteurLineWasUpdated(ligne, "Point de rassemblement");

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/updatePDRForLine", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: errorId, value: lineId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error, value } = Joi.object({
      transportType: Joi.string(),
      meetingHour: Joi.string(),
      busArrivalHour: Joi.string(),
      departureHour: Joi.string(),
      returnHour: Joi.string(),
      meetingPointId: Joi.string(),
      newMeetingPointId: Joi.string(),
      sendEmailCampaign: Joi.boolean(),
    }).validate(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const updatedLigneBus = await updatePDRForLine(lineId, value, req.user);

    const infoBus = await getInfoBus(updatedLigneBus);
    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    if (error.message === ERRORS.NOT_FOUND) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    if (error.message === ERRORS.INVALID_BODY) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    if (error.message === ERRORS.INVALID_PARAMS) {
      return res.status(400).send({ ok: false, code: error.message });
    }
    if (error.message === ERRORS.OPERATION_UNAUTHORIZED) {
      return res.status(403).send({ ok: false, code: error.message });
    }
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/point-de-rassemblement/:meetingPointId", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      meetingPointId: Joi.string().required(),
    }).validate({ ...req.params, ...req.body });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (req.user.role !== "admin") return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const { id, meetingPointId } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const meetingPoint = await PointDeRassemblementModel.findById(meetingPointId);
    if (!meetingPoint) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let ligneToPoint = await LigneToPointModel.findOne({ lineId: id, meetingPointId });
    if (ligneToPoint) {
      ligneToPoint.set({ deletedAt: undefined });
      await ligneToPoint.save({ fromUser: req.user });
    } else {
      ligneToPoint = await LigneToPointModel.create({
        lineId: ligne._id.toString(),
        meetingPointId: meetingPoint._id.toString(),
        transportType: "bus",
        returnHour: "00:00",
        meetingHour: "00:00",
        departureHour: "00:00",
        busArrivalHour: "00:00",
      });
    }

    ligne.set({ meetingPointsIds: [...ligne.meetingPointsIds, meetingPoint._id.toString()] });
    await ligne.save({ fromUser: req.user });

    // * Update slave PlanTransport
    const planDeTransport = await PlanTransportModel.findById(id);
    if (!planDeTransport) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const pointDeRassemblement = await PointDeRassemblementModel.findById(new mongoose.Types.ObjectId(meetingPoint._id));
    if (!pointDeRassemblement) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    planDeTransport.pointDeRassemblements.push({
      meetingPointId: meetingPoint._id,
      ...pointDeRassemblement._doc,
      busArrivalHour: ligneToPoint.busArrivalHour,
      meetingHour: ligneToPoint.meetingHour,
      departureHour: ligneToPoint.departureHour,
      returnHour: ligneToPoint.returnHour,
      transportType: ligneToPoint.transportType,
    });

    await planDeTransport.save({ fromUser: req.user });
    // * End update slave PlanTransport

    const infoBus = await getInfoBus(ligne);

    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const ligneBus = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const infoBus = await getInfoBus(ligneBus);
    return res.status(200).send({ ok: true, data: infoBus });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/availablePDRByRegion", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const ligneBus = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!ligneBus.meetingPointsIds.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const pointDeRassemblement = await PointDeRassemblementModel.findById(ligneBus.meetingPointsIds[0]);
    if (!pointDeRassemblement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const PDR = await PointDeRassemblementModel.find({ region: pointDeRassemblement.region, deletedAt: { $exists: false } });

    return res.status(200).send({ ok: true, data: PDR });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/availablePDR", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const ligneBus = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const listGroup = await SchemaDeRepartitionModel.find({ centerId: ligneBus.centerId });

    let idPDR: string[] = [];
    for (let group of listGroup) {
      for (let pdr of group.gatheringPlaces) {
        if (!idPDR.includes(pdr)) {
          idPDR.push(pdr);
        }
      }
    }

    const PDR = await PointDeRassemblementModel.find({ _id: { $in: idPDR }, deletedAt: { $exists: false } });

    return res.status(200).send({ ok: true, data: PDR });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/ligne-to-points", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const ligneBus = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const ligneToPoints = await LigneToPointModel.find({ lineId: id, meetingPointId: { $in: ligneBus.meetingPointsIds }, deletedAt: { $exists: false } });

    for (let ligneToPoint of ligneToPoints) {
      const meetingPoint = await PointDeRassemblementModel.findById(ligneToPoint.meetingPointId);
      // @ts-ignore
      ligneToPoint._doc.meetingPoint = meetingPoint;
    }

    return res.status(200).send({ ok: true, data: ligneToPoints });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/data-for-check", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: id } = validateId(req.params.id);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const ligneBus = await LigneBusModel.findById(id);
    if (!ligneBus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    //Get all youngs for this ligne and by meeting point
    const queryYoung = [
      { $match: { _id: ligneBus._id } },
      { $unwind: "$meetingPointsIds" },
      {
        $lookup: {
          from: "youngs",
          let: { meetingPoint: "$meetingPointsIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$cohort", ligneBus.cohort] },
                    { $eq: ["$status", "VALIDATED"] },
                    { $eq: ["$sessionPhase1Id", ligneBus.sessionId] },
                    { $eq: ["$ligneId", ligneBus._id.toString()] },
                    { $eq: ["$meetingPointId", "$$meetingPoint"] },
                    { $ne: ["$cohesionStayPresence", "false"] },
                    { $ne: ["$departInform", "true"] },
                  ],
                },
              },
            },
          ],
          as: "youngs",
        },
      },
      {
        $lookup: {
          from: "youngs",
          let: { id: ligneBus._id.toString() },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$ligneId", "$$id"] }, { $eq: ["$status", "VALIDATED"] }],
                },
              },
            },
          ],
          as: "youngsBus",
        },
      },
      {
        $project: { meetingPointsIds: 1, youngsCount: { $size: "$youngs" }, youngsBusCount: { $size: "$youngsBus" } },
      },
    ];

    const dataYoung = await LigneBusModel.aggregate(queryYoung).exec();

    let result: any = {
      meetingPoints: [],
    };
    let youngsCountBus = 0;
    for (let data of dataYoung) {
      result.meetingPoints.push({ youngsCount: data.youngsCount, meetingPointId: data.meetingPointsIds });
      youngsCountBus = data.youngsBusCount;
    }
    result.youngsCountBus = youngsCountBus;

    //Get young volume need for the destination center in bus
    const dataBus = await LigneBusModel.find({ sessionId: ligneBus.sessionId, _id: { $ne: ligneBus._id } });

    let busVolume = 0;
    for (let data of dataBus) {
      busVolume += data.youngCapacity;
    }

    result.busVolume = busVolume;

    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/cohort/:cohort/hasValue", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
    }).validate({ ...req.params });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canViewLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let { cohort } = value;

    const ligne = await LigneBusModel.findOne({ cohort });

    return res.status(200).send({ ok: true, data: !!ligne });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const PATCHES_COUNT_PER_PAGE = 20;
const HIDDEN_FIELDS = ["/missionsInMail", "/historic", "/uploadedAt", "/sessionPhase1Id", "/correctedAt", "/lastStatusAt", "/token", "/Token"];
const IGNORED_VALUES = [null, undefined, "", "Vide", "[]", false];

/**
 * Pour l'historique du plan de transport, permet de récupérer la liste des options des filtres
 */
router.get("/patches/filter-options", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const db = mongoose.connection.db;
    const busline = {
      op: await db.collection("lignebus_patches").distinct("ops.op"),
      path: await db.collection("lignebus_patches").distinct("ops.path"),
      user: await db.collection("lignebus_patches").distinct("user"),
    };
    const lineToPoint = {
      op: await db.collection("lignetopoint_patches").distinct("ops.op"),
      path: await db.collection("lignetopoint_patches").distinct("ops.path"),
      user: await db.collection("lignetopoint_patches").distinct("user"),
    };
    // const modifications = {
    //   op: await db.collection("modificationbus_patches").distinct("ops.op"),
    //   path: await db.collection("modificationbus_patches").distinct("ops.path"),
    //   user: await db.collection("modificationbus_patches").distinct("user"),
    // };

    const op = mergeArrayItems([...busline.op, ...lineToPoint.op /*, ...modifications.op*/]);
    const path = mergeArrayItems([...busline.path, ...lineToPoint.path /*, ...modifications.path*/]);
    const user = mergeArrayItems([...busline.user, ...lineToPoint.user /*, ...modifications.user*/], "_id");

    return res.status(200).send({
      ok: true,
      data: { op, path, user },
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

/**
 * Historique des plan de transports
 * (on cherche l'historique dans 3 patches (lignebus, modificationBus et ligneToPoint)
 */
router.get("/patches/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    // --- validate data
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
    }).validate(req.params);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { error: errorQuery, value: valueQuery } = Joi.object({
      offset: Joi.number(),
      limit: Joi.number().default(PATCHES_COUNT_PER_PAGE),
      page: Joi.number()
        .integer()
        .default(0)
        .custom((value, helpers) => {
          if (value < 0) {
            return 0;
          }
          return value;
        }),
      op: Joi.string(),
      path: Joi.string(),
      userId: Joi.string(),
      query: Joi.string().trim().lowercase(),
      nopagination: Joi.string(),
      // filter: Joi.string().trim().allow("", null),
    }).validate(req.query, {
      stripUnknown: true,
    });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    let { offset, limit, page, op: filterOp, path: filterPath, userId: filterUserId, query: filterQuery, nopagination } = valueQuery;
    if (filterQuery && filterQuery.trim().length === 0) {
      filterQuery = undefined;
    }

    // --- security
    if (!canViewPatchesHistory(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // --- query
    // ------ find all patches ids
    const { cohort } = value;
    const lines = await LigneBusModel.find({ cohort });
    if (lines.length > 0) {
      const lineIds = lines.map((line) => line._id);
      const lineSet = {};
      for (const line of lines) {
        lineSet[line._id.toString()] = line;
      }
      const lineStringIds = lineIds.map((l) => l.toString());
      const lineToPoints = await LigneToPointModel.find({ lineId: { $in: lineStringIds } }, { _id: 1, lineId: 1 });
      const lineToPointIds = lineToPoints.map((line) => line._id);
      const lineToPointSet = {};
      for (const ltp of lineToPoints) {
        lineToPointSet[ltp._id.toString()] = ltp.lineId;
      }

      // ------ compute filters
      let filterOpFunction;
      if (filterOp && filterOp.trim().length > 0) {
        if (filterPath && filterPath.trim().length > 0) {
          const realFilterPath = (filterPath.trim()[0] === "/" ? "" : "/") + filterPath.trim();
          filterOpFunction = (op) => op.path === realFilterPath && op.op === filterOp;
        } else {
          filterOpFunction = (op) => op.op === filterOp;
        }
      } else {
        if (filterPath && filterPath.trim().length > 0) {
          const realFilterPath = (filterPath.trim()[0] === "/" ? "" : "/") + filterPath.trim();
          filterOpFunction = (op) => op.path === realFilterPath;
        } else {
          filterOpFunction = () => true;
        }
      }
      let filterUserFunction;
      if (filterUserId && filterUserId.trim().length > 0) {
        filterUserFunction = (doc) => doc.user && doc.user._id && doc.user._id.toString() === filterUserId;
      } else {
        filterUserFunction = () => true;
      }

      // --- get all ops...
      const db = mongoose.connection.db;
      let patches: any[] = [];

      // --- lignebus patches...
      let cursor = db.collection("lignebus_patches").find({ ref: { $in: lineIds } });
      for await (const doc of cursor) {
        if (doc.ops && filterUserFunction(doc)) {
          const bus = lineSet[doc.ref];
          for (const op of doc.ops) {
            if (filterOpFunction(op) && !HIDDEN_FIELDS.includes(op.path) && !IGNORED_VALUES.includes(op.value) && !IGNORED_VALUES.includes(op.originalValue)) {
              patches.push({
                modelName: doc.modelName,
                date: doc.date,
                ref: bus?._id,
                refName: bus?.busId,
                op: op.op,
                path: op.path,
                value: op.value,
                originalValue: op.originalValue,
                user: doc.user,
              });
            }
          }
        }
      }

      // --- lineToPoints patches...
      cursor = db.collection("lignetopoint_patches").find({ ref: { $in: lineToPointIds } });
      for await (const doc of cursor) {
        if (doc.ops && filterUserFunction(doc)) {
          const lineId = lineToPointSet[doc.ref.toString()];
          const bus = lineId ? lineSet[lineId] : {};
          for (const op of doc.ops) {
            if (filterOpFunction(op) && !HIDDEN_FIELDS.includes(op.path) && !IGNORED_VALUES.includes(op.value) && !IGNORED_VALUES.includes(op.originalValue)) {
              patches.push({
                modelName: doc.modelName,
                date: doc.date,
                ref: bus?._id.toString(),
                refName: bus.busId,
                op: op.op,
                path: op.path,
                value: op.value,
                originalValue: op.originalValue,
                user: doc.user,
              });
            }
          }
        }
      }

      // --- results
      if (patches && patches.length > 0) {
        let results;

        // --- filtrage texte libre
        if (filterQuery) {
          results = patches.filter((p) => {
            return filterPatchWithQuery(p, filterQuery);
          });
        } else {
          results = patches;
        }

        // --- sort patches
        patches.sort((a, b) => {
          return b.date.valueOf() - a.date.valueOf();
        });

        if (nopagination) {
          // --- result without pagination
          return res.status(200).send({
            ok: true,
            data: results,
            pagination: {
              count: results.length,
              pageCount: 1,
              page: 0,
              itemsPerPage: results.length,
            },
          });
        } else {
          // --- result with pagination
          if (offset === undefined || offset === null) {
            if (page === undefined || page === null || page < 1) {
              offset = 0;
            } else {
              offset = page * limit;
            }
          }
          return res.status(200).send({
            ok: true,
            data: results.slice(offset, offset + limit),
            pagination: {
              count: results.length,
              pageCount: Math.ceil(results.length / limit),
              page: Math.floor(offset / limit),
              itemsPerPage: limit,
            },
          });
        }
      } else {
        return res.status(200).send({
          ok: true,
          data: [],
          pagination: {
            count: 0,
            pageCount: 0,
            page: 0,
            itemsPerPage: limit,
          },
        });
      }
    } else {
      return res.status(200).send({ ok: true, data: [], pagination: { count: 0, pageCount: 0, page: 0 } });
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/notifyRef", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate({ ...req.params });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!isAdmin(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let { id } = value;

    const ligne = await LigneBusModel.findById(id);
    if (!ligne) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const pdrs = await PointDeRassemblementModel.find({ _id: ligne.meetingPointsIds });
    if (!pdrs?.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const center = await CohesionCenterModel.findById(ligne.centerId);
    if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const departmentListToNotify = pdrs.map((pdr) => pdr.department);
    departmentListToNotify.push(center.department!);

    const regionListToNotify = pdrs.map((pdr) => pdr.region);
    regionListToNotify.push(center.region!);

    const subRoleRefDep = ["manager_department", "assistant_manager_department", "secretariat", "manager_phase2"];
    const subRoleRefReg = ["coordinator", "assistant_coordinator", "manager_phase2"];

    //on recherche les refDep des 2 departments avec les bon subRole
    //ET les ref regionnaux des 2 regions avec les bons subRole

    const referents = await ReferentModel.find({
      $or: [
        {
          department: { $in: departmentListToNotify },
          role: "referent_department",
          subRole: { $in: subRoleRefDep },
        },
        {
          role: "referent_region",
          subRole: { $in: subRoleRefReg },
          region: { $in: regionListToNotify },
        },
      ],
    });
    if (!referents?.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    //on prend un ref de chaque departement de la liste trié par subRole
    //et un ref de chaque region de la liste trié par subRole

    const referentsToNotify: any[] = [];

    const getRefListToNotify = (type, list, subRoles) => {
      for (let i = 0; i < list.length; i++) {
        //place = soit une region soit un departement
        const place = list[i];
        let referentsFromPlace: any = null;
        //on filtre les user du departement ou de la region
        if (type === "region") {
          referentsFromPlace = referents.filter((u) => u.region === place && u.role === "referent_region");
        }
        if (type === "department") {
          referentsFromPlace = referents.filter((u) => u.department.includes(place) && u.role === "referent_department");
        }
        for (const subRole of subRoles) {
          //on recupere le premier user filtré qui a le bon subRole (le premier subRole du tableau) si il y en a pas le 2eme subRole etc...
          const referentToNotifyInPlace = referentsFromPlace.find((u) => u.subRole === subRole);

          if (referentToNotifyInPlace) {
            //si on en trouve un on s'arrete la (on ne veut quún ref par departement/region)
            referentsToNotify.push(referentToNotifyInPlace);
            break;
          }
        }
      }
    };

    //on recupere la liste des ref regionnaux a prevenir
    getRefListToNotify("region", regionListToNotify, subRoleRefReg);
    //on recupere la liste des ref departementaux a prevenir
    getRefListToNotify("department", departmentListToNotify, subRoleRefDep);

    //on genere le tableau des referents selectionné pour etre notifié
    const uniqueUsersToNotify = [...new Set(referentsToNotify.map((obj) => JSON.stringify(obj)))].map((str) => JSON.parse(str));

    // send notification
    await sendTemplate(SENDINBLUE_TEMPLATES.PLAN_TRANSPORT.NOTIF_REF, {
      emailTo: uniqueUsersToNotify.map((referent) => ({
        name: `${referent.firstName} ${referent.lastName}`,
        email: referent.email,
      })),
      params: {
        lineName: ligne.busId,
        cta: `${config.ADMIN_URL}/ligne-de-bus/${ligne._id.toString()}`,
      },
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

function pathToKey(path) {
  if (path && path.length > 0) {
    let key = path[0] === "/" ? path.substring(1) : path;
    const idx = key.indexOf("/");
    if (idx >= 0) {
      key = key.substring(0, idx);
    }
    return key;
  } else {
    return path;
  }
}

function filterPatchWithQuery(p, query) {
  return (
    // bus
    p.refName?.toLowerCase()?.includes(query) ||
    // field
    translateBusPatchesField(pathToKey(p.path)).toLowerCase().includes(query) ||
    // original-value
    (p.originalValue && (isIsoDate(p.originalValue) ? formatStringLongDate(p.originalValue) : p.originalValue.toString())?.toLowerCase().includes(query)) ||
    // value
    (p.value && (isIsoDate(p.value) ? formatStringLongDate(p.value) : p.value.toString())?.toLowerCase().includes(query))
  );
}

function mergeArrayItems(array: any[], subProperty?: string | null | undefined) {
  let set = {};
  for (const item of array) {
    if (subProperty) {
      if (item[subProperty]) {
        const p = pathToKey(item[subProperty].toString());
        if (p) {
          set[p] = item;
        }
      }
    } else {
      const p = pathToKey(item);
      if (p) {
        set[p] = p;
      }
    }
  }
  return Object.values(set);
}

export default router;
