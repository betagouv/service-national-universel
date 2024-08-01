import { BusTeamDto } from "snu-lib/src/dto";
import { LigneBusDocument } from "../../models";
import { LigneToPointModel, PointDeRassemblementModel, LigneBusModel, CohesionCenterModel } from "../../models";
import { mapBusTeamToUpdate } from "./ligneDeBusMapper";
import { ClientSession } from "mongoose";

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
    mergedBusDetails = (await findLigneDeBusByBusIds(line.mergedBusIds, line.cohort)).map((b: LigneBusDocument) => ({
      _id: b._id,
      busId: b.busId,
      totalCapacity: b.totalCapacity,
      youngSeatsTaken: b.youngSeatsTaken,
      youngCapacity: b.youngCapacity,
    }));
  }

  return { ...line._doc, meetingsPointsDetail, centerDetail, mergedBusDetails };
}

export async function syncMergedBus({
  ligneBus,
  busIdsToUpdate,
  newMergedBusIds,
  transaction,
}: {
  ligneBus: LigneBusDocument;
  busIdsToUpdate: string[];
  newMergedBusIds: string[];
  transaction?: ClientSession | null;
}) {
  for (const mergedBusId of busIdsToUpdate) {
    let ligneBusToUpdate: LigneBusDocument | null = ligneBus;
    if (mergedBusId !== ligneBus.busId) {
      ligneBusToUpdate = await LigneBusModel.findOne({ busId: mergedBusId, cohort: ligneBus.cohort, deletedAt: { $exists: false } });
    }
    if (ligneBusToUpdate) {
      ligneBusToUpdate.set({ mergedBusIds: newMergedBusIds });
      await ligneBusToUpdate.save({ session: transaction });
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
      memberToDelete.remove();
      await ligne.save({ fromUser });
    }
  }
};
