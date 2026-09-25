import { LigneBusDocument, LigneToPointModel, PointDeRassemblementModel, LigneBusModel, CohesionCenterModel } from "../../models";

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
