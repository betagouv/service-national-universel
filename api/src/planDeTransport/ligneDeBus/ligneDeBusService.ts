import { BusTeamDto } from "snu-lib/src/dto";
import { ClasseModel, LigneBusDocument, SessionPhase1Model } from "../../models";
import { LigneToPointModel, PointDeRassemblementModel, LigneBusModel, CohesionCenterModel, PlanTransportModel, YoungModel, CohortModel } from "../../models";
import { mapBusTeamToUpdate } from "./ligneDeBusMapper";
import { Types, ClientSession } from "mongoose";

import { CohortType, ERRORS, SENDINBLUE_TEMPLATES, UserDto, checkTime } from "snu-lib";
import { sendTemplate } from "../../brevo";
import { updatePlacesSessionPhase1 } from "../../utils";
import { endSession, startSession, withTransaction } from "../../mongo";

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
  if (!ligneBus) throw new Error("NOT_FOUND");

  const cohort = await CohortModel.findOne({ name: ligneBus.cohort });
  if (!cohort) throw new Error("NOT_FOUND");

  if (checkTime(departureHour, meetingHour) || checkTime(departureHour, busArrivalHour)) {
    throw new Error("INVALID_BODY");
  }

  const ligneToPoint = await LigneToPointModel.findOne({ lineId: ligneBusId, meetingPointId });
  if (!ligneToPoint) throw new Error("NOT_FOUND");

  ligneToPoint.set({
    transportType,
    meetingHour,
    busArrivalHour,
    departureHour,
    returnHour,
    ...(meetingPointId !== newMeetingPointId && { meetingPointId: newMeetingPointId }),
  });

  await ligneToPoint.save({ fromUser: user });

  if (meetingPointId !== newMeetingPointId) {
    const meetingPointsIds = ligneBus.meetingPointsIds.filter((id) => id !== meetingPointId);
    meetingPointsIds.push(newMeetingPointId);
    ligneBus.set({ meetingPointsIds });
    await ligneBus.save({ fromUser: user });
  }

  const planDeTransport = await PlanTransportModel.findById(ligneBusId);
  if (!planDeTransport) throw new Error("NOT_FOUND");

  const pointDeRassemblement = await PointDeRassemblementModel.findById(new ObjectId(newMeetingPointId));
  if (!pointDeRassemblement) throw new Error("NOT_FOUND");

  const meetingPoint = planDeTransport.pointDeRassemblements.find((mp) => mp.meetingPointId === meetingPointId);
  if (!meetingPoint) throw new Error("NOT_FOUND");

  meetingPoint.set({
    meetingPointId: newMeetingPointId,
    ...pointDeRassemblement._doc,
    busArrivalHour: ligneToPoint.busArrivalHour,
    meetingHour: ligneToPoint.meetingHour,
    departureHour: ligneToPoint.departureHour,
    returnHour: ligneToPoint.returnHour,
    transportType: ligneToPoint.transportType,
  });

  await planDeTransport.save({ fromUser: user });

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
    { fromUser: user },
  );

  if (shouldSendEmailCampaign && youngUpdateResult.modifiedCount > 0) {
    await sendEmailCampaign(ligneBusId, newMeetingPointId, cohort);
  }

  return ligneBus;
};

export async function updateSessionForLine(ligne: LigneBusDocument, sessionId: string, actor: UserDto) {
  const currentSessionPhase1 = await SessionPhase1Model.findById(ligne.sessionId);
  if (!currentSessionPhase1) throw new Error(ERRORS.NOT_FOUND);

  const newSessionPhase1 = await SessionPhase1Model.findById(sessionId);
  if (!newSessionPhase1) throw new Error(ERRORS.NOT_FOUND);

  const transaction = await startSession();

  try {
    await withTransaction(transaction, async () => {
      // Ligne
      ligne.set({
        sessionId,
        centerId: newSessionPhase1.cohesionCenterId,
      });

      await ligne.save({ fromUser: actor });

      // Plan de transport
      const planDeTransport = await PlanTransportModel.findById(ligne._id);
      if (!planDeTransport) throw new Error(ERRORS.NOT_FOUND);

      planDeTransport.set({
        centerId: newSessionPhase1.cohesionCenterId,
        centerRegion: newSessionPhase1.region,
        centerDepartment: newSessionPhase1.department,
        centerAddress: newSessionPhase1.cityCentre,
        centerZip: newSessionPhase1.zipCentre,
        centerName: newSessionPhase1.nameCentre,
        centerCode: newSessionPhase1.codeCentre,
      });

      await planDeTransport.save({ fromUser: actor });

      // Jeunes
      const filter = { ligneId: ligne._id };
      const updateDoc = { $set: { sessionPhase1Id: sessionId, cohesionCenterId: newSessionPhase1.cohesionCenterId } };
      await YoungModel.updateMany(filter, updateDoc, { fromUser: actor });

      // Classe
      const classe = await ClasseModel.findOne({ ligneId: ligne._id });
      if (classe) {
        classe.set({ sessionId, cohesionCenterId: newSessionPhase1.cohesionCenterId });
        await classe.save({ fromUser: actor });
      }
    });
  } catch (error) {
    await transaction.abortTransaction();
    throw error;
  } finally {
    await endSession(transaction);
  }

  await updatePlacesSessionPhase1(currentSessionPhase1, actor);
  await updatePlacesSessionPhase1(newSessionPhase1, actor);
}

const sendEmailCampaign = async (ligneBusId: string, newMeetingPointId: string, cohort: CohortType) => {
  const updatedYoungs = await YoungModel.find({
    ligneId: ligneBusId,
    meetingPointId: newMeetingPointId,
  }).select("email parent1Email parent2Email");

  let templateId: string | null = null;
  if (new Date() < new Date(cohort.dateStart)) {
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_DEPARTURE;
  } else if (new Date() < new Date(cohort.dateEnd)) {
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_RETURN;
  }

  if (!templateId) throw new Error("Modification date is out of range, no email sent.");

  for (const young of updatedYoungs) {
    const cc: { email: string }[] = [];
    if (young.parent1Email) cc.push({ email: young.parent1Email });
    if (young.parent2Email) cc.push({ email: young.parent2Email });

    await sendTemplate(templateId, {
      emailTo: [{ email: young.email }],
      cc,
    });
  }
};

export const notifyYoungChangeCenter = async (ligneBusId: string) => {
  const updatedYoungs = await YoungModel.find({
    ligneId: ligneBusId,
  }).select("email parent1Email parent2Email");

  const templateId = SENDINBLUE_TEMPLATES.young.PHASE_1_CHANGEMENT_CENTRE;

  for (const young of updatedYoungs) {
    const cc: { email: string }[] = [];
    if (young.parent1Email) cc.push({ email: young.parent1Email });
    if (young.parent2Email) cc.push({ email: young.parent2Email });

    await sendTemplate(templateId, { emailTo: [{ email: young.email }], cc });
  }
};
