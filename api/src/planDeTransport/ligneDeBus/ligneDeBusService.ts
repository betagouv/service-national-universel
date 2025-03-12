import {
  ClasseModel,
  LigneBusDocument,
  SessionPhase1Document,
  SessionPhase1Model,
  LigneToPointModel,
  PointDeRassemblementModel,
  LigneBusModel,
  CohesionCenterModel,
  PlanTransportModel,
  YoungModel,
  CohortModel,
} from "../../models";
import { mapBusTeamToUpdate } from "./ligneDeBusMapper";
import { Types, ClientSession } from "mongoose";
import { ERRORS, UserDto, checkTime, BusTeamDto } from "snu-lib";
import { updatePlacesSessionPhase1 } from "../../utils";
import { endSession, startSession, withTransaction } from "../../mongo";
import { notifyReferentsCLELineWasUpdated, notifyYoungsAndRlsPDRWasUpdated, notifyYoungsAndRlsSessionWasUpdated } from "./ligneDeBusNotificationService";
import { logger } from "../../logger";

const { ObjectId } = Types;

export const findLigneDeBusByBusIds = async (busIds: string[], cohort: string): Promise<LigneBusDocument[]> => {
  return await LigneBusModel.find({ busId: { $in: busIds }, cohort, deletedAt: { $exists: false } });
};

export async function getInfoBus(line: LigneBusDocument) {
  const ligneToBus = await LigneToPointModel.find({ lineId: line._id });

  let meetingsPointsDetail = [];
  for (let line of ligneToBus) {
    const pointDeRassemblement = await PointDeRassemblementModel.findById(line.meetingPointId);
    // @ts-expect-error remove when model type is available
    meetingsPointsDetail.push({ ...line._doc, ...pointDeRassemblement._doc });
  }

  const centerDetail = await CohesionCenterModel.findById(line.centerId);

  let mergedBusDetails: { _id: string; busId: string; totalCapacity: number; youngSeatsTaken: number; youngCapacity: number }[] = [];
  if (line.mergedBusIds && line.mergedBusIds.length > 0) {
    mergedBusDetails = (await findLigneDeBusByBusIds(line.mergedBusIds, line.cohort)).map((ligneBus: LigneBusDocument) => ({
      _id: ligneBus._id,
      busId: ligneBus.busId,
      totalCapacity: ligneBus.totalCapacity,
      youngSeatsTaken: ligneBus.youngSeatsTaken,
      youngCapacity: ligneBus.youngCapacity,
    }));
  }

  let mirrorBusDetails: { _id: string; busId: string; totalCapacity: number; youngSeatsTaken: number; youngCapacity: number } | null = null;
  if (line.mirrorBusId) {
    mirrorBusDetails = (await findLigneDeBusByBusIds([line.mirrorBusId], line.cohort)).map((ligneBus: LigneBusDocument) => ({
      _id: ligneBus._id,
      busId: ligneBus.busId,
      totalCapacity: ligneBus.totalCapacity,
      youngSeatsTaken: ligneBus.youngSeatsTaken,
      youngCapacity: ligneBus.youngCapacity,
    }))[0];
  }
  return { ...line._doc, meetingsPointsDetail, centerDetail, mergedBusDetails, mirrorBusDetails };
}

export async function syncMergedBus({
  ligneBus,
  busIdsToUpdate,
  newMergedBusIds,
  transaction,
  fromUser,
}: {
  ligneBus: LigneBusDocument;
  busIdsToUpdate: string[];
  newMergedBusIds: string[];
  transaction?: ClientSession | null;
  fromUser?: string;
}) {
  for (const mergedBusId of busIdsToUpdate) {
    let ligneBusToUpdate: LigneBusDocument | null = ligneBus;
    if (mergedBusId !== ligneBus.busId) {
      ligneBusToUpdate = await LigneBusModel.findOne({ busId: mergedBusId, cohort: ligneBus.cohort, deletedAt: { $exists: false } });
    }
    if (ligneBusToUpdate) {
      ligneBusToUpdate.set({ mergedBusIds: newMergedBusIds });
      await ligneBusToUpdate.save({ session: transaction, fromUser: fromUser ? { firstName: fromUser } : undefined });
    }
  }
}

export const updateTeamByLigneDeBusIds = async ({ busIds, cohort, busTeamDto, fromUser }: { busIds: string[]; cohort: string; busTeamDto: BusTeamDto; fromUser }) => {
  const lignesDeBus = await findLigneDeBusByBusIds(busIds, cohort);
  const memberData = mapBusTeamToUpdate(busTeamDto);
  for (const ligne of lignesDeBus) {
    const memberToUpdate = ligne.team.id(busTeamDto.idTeam);
    if (!memberToUpdate) {
      ligne.team.push({ _id: busTeamDto._id, ...memberData });
    } else {
      memberToUpdate.set(memberData);
    }
    await ligne.save({ fromUser });
  }
};

export const removeTeamByLigneDeBusIds = async ({ busIds, cohort, idTeam, fromUser }: { busIds: string[]; cohort: string; idTeam: string; fromUser }) => {
  const lignesDeBus = await findLigneDeBusByBusIds(busIds, cohort);
  for (const ligne of lignesDeBus) {
    const memberToDelete = ligne.team.id(idTeam);
    if (memberToDelete) {
      memberToDelete.deleteOne();
      await ligne.save({ fromUser });
    }
  }
};

export const updatePDRForLine = async (
  ligneBusId: string,
  transportType: string,
  meetingHour: string,
  busArrivalHour: string,
  departureHour: string,
  returnHour: string,
  meetingPointId: string,
  newMeetingPointId: string,
  shouldSendEmailCampaign: boolean,
  user: UserDto,
) => {
  const ligneBus = await LigneBusModel.findById(ligneBusId);
  if (!ligneBus) {
    logger.error(`LigneBus not found ${ligneBusId}`);
    throw new Error("NOT_FOUND");
  }

  const cohort = await CohortModel.findOne({ name: ligneBus.cohort });
  if (!cohort) {
    logger.error(`Cohort not found ${ligneBus.cohort}`);
    throw new Error("NOT_FOUND");
  }

  if (checkTime(departureHour, meetingHour) || checkTime(departureHour, busArrivalHour)) {
    throw new Error("INVALID_BODY");
  }

  const ligneToPoint = await LigneToPointModel.findOne({ lineId: ligneBusId, meetingPointId });
  if (!ligneToPoint) {
    logger.error(`LigneToPoint not found ${ligneBusId} ${meetingPointId}`);
    throw new Error("NOT_FOUND");
  }

  const transaction = await startSession();
  try {
    await withTransaction(transaction, async () => {
      ligneToPoint.set({
        transportType,
        meetingHour,
        busArrivalHour,
        departureHour,
        returnHour,
        ...(meetingPointId !== newMeetingPointId && { meetingPointId: newMeetingPointId }),
      });

      await ligneToPoint.save({ fromUser: user, session: transaction });

      if (meetingPointId !== newMeetingPointId) {
        const meetingPointsIds = ligneBus.meetingPointsIds.filter((id) => id !== meetingPointId);
        meetingPointsIds.push(newMeetingPointId);
        ligneBus.set({ meetingPointsIds });
        await ligneBus.save({ fromUser: user, session: transaction });
      }

      const planDeTransport = await PlanTransportModel.findById(ligneBusId);
      if (!planDeTransport) {
        logger.error(`PlanTransport not found ${ligneBusId}`);
        throw new Error("NOT_FOUND");
      }

      const pointDeRassemblement = await PointDeRassemblementModel.findById(new ObjectId(newMeetingPointId));
      if (!pointDeRassemblement) {
        logger.error(`PointDeRassemblement not found ${newMeetingPointId}`);
        throw new Error("NOT_FOUND");
      }

      const meetingPoint = planDeTransport.pointDeRassemblements.find((mp) => mp.meetingPointId === meetingPointId);
      if (!meetingPoint) {
        logger.error(`MeetingPoint not found ${meetingPointId}`);
        throw new Error("NOT_FOUND");
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

      await planDeTransport.save({ fromUser: user, session: transaction });

      const youngUpdateResult = await YoungModel.updateMany(
        {
          ligneId: ligneBusId,
          meetingPointId: meetingPointId,
        },
        {
          $set: {
            meetingPointId: newMeetingPointId,
          },
        },
        { fromUser: user, session: transaction },
      );

      if (shouldSendEmailCampaign && youngUpdateResult.modifiedCount > 0) {
        const updatedYoungs = await YoungModel.find({ ligneId: ligneBusId, meetingPointId: newMeetingPointId });
        await notifyYoungsAndRlsPDRWasUpdated(updatedYoungs, cohort);
      }
    });
  } finally {
    await endSession(transaction);
  }

  return ligneBus;
};

export const updateSessionForLine = async ({
  ligne,
  session,
  user,
  sendCampaign,
}: {
  ligne: LigneBusDocument;
  session: SessionPhase1Document;
  user: UserDto;
  sendCampaign?: boolean;
}) => {
  const currentSessionPhase1 = await SessionPhase1Model.findById(ligne.sessionId);
  if (!currentSessionPhase1) throw new Error(ERRORS.NOT_FOUND);

  if (ligne.youngSeatsTaken > (session.placesLeft || 0)) {
    throw new Error(ERRORS.OPERATION_NOT_ALLOWED);
  }

  const transaction = await startSession();

  try {
    await withTransaction(transaction, async () => {
      // Ligne
      ligne.set({
        sessionId: session.id,
        centerId: session.cohesionCenterId,
      });
      await ligne.save({ fromUser: user, session: transaction });

      // Plan de transport
      const planDeTransport = await PlanTransportModel.findById(ligne._id);
      if (!planDeTransport) throw new Error(ERRORS.NOT_FOUND);
      planDeTransport.set({
        centerId: session.cohesionCenterId,
        centerRegion: session.region,
        centerDepartment: session.department,
        centerAddress: session.cityCentre,
        centerZip: session.zipCentre,
        centerName: session.nameCentre,
        centerCode: session.codeCentre,
      });
      await planDeTransport.save({ fromUser: user, session: transaction });

      // Jeunes
      const filter = { ligneId: ligne._id };
      const updateDoc = { $set: { sessionPhase1Id: session.id, cohesionCenterId: session.cohesionCenterId } };
      await YoungModel.updateMany(filter, updateDoc, { fromUser: user, session: transaction });

      // Classes
      const classes = await ClasseModel.find({ ligneId: ligne._id });
      for (const classe of classes) {
        classe.set({
          sessionId: session.id,
          cohesionCenterId: session.cohesionCenterId,
        });
        await classe.save({ fromUser: user, session: transaction });
      }
    });

    await updatePlacesSessionPhase1(currentSessionPhase1, user);
    await updatePlacesSessionPhase1(session, user);

    if (sendCampaign) {
      const updatedYoungs = await YoungModel.find({ ligneId: ligne._id });
      await notifyYoungsAndRlsSessionWasUpdated(updatedYoungs);
      const classes = await ClasseModel.find({ ligneId: ligne._id });
      for (const classe of classes) {
        await notifyReferentsCLELineWasUpdated(classe);
      }
    }
  } finally {
    await endSession(transaction);
  }
};
