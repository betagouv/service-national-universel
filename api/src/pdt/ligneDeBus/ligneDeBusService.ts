import { BusDocument } from "../../models/PlanDeTransport/ligneBus.type";

const { LigneToPointModel, PointDeRassemblementModel, LigneBusModel, CohesionCenterModel } = require("../../models");

export async function getInfoBus(line: BusDocument) {
  const ligneToBus = await LigneToPointModel.find({ lineId: line._id });

  let meetingsPointsDetail = [];
  for (let line of ligneToBus) {
    const pointDeRassemblement = await PointDeRassemblementModel.findById(line.meetingPointId);
    // @ts-expect-error remove when model type is available
    meetingsPointsDetail.push({ ...line._doc, ...pointDeRassemblement._doc });
  }

  const centerDetail = await CohesionCenterModel.findById(line.centerId);

  let mergedBusDetails = [];
  if (line.mergedBusIds && line.mergedBusIds.length > 0) {
    mergedBusDetails = (await LigneBusModel.find({ busId: { $in: line.mergedBusIds }, cohort: line.cohort, deletedAt: { $exists: false } })).map((b: BusDocument) => ({
      _id: b._id,
      busId: b.busId,
      totalCapacity: b.totalCapacity,
      youngSeatsTaken: b.youngSeatsTaken,
      youngCapacity: b.youngCapacity,
    }));
  }

  // @ts-expect-error _doc is defined
  return { ...line._doc, meetingsPointsDetail, centerDetail, mergedBusDetails };
}

export async function syncMergedBus({ ligneBus, busIdsToUpdate, newMergedBusIds }: { ligneBus: BusDocument; busIdsToUpdate: string[]; newMergedBusIds: string[] }) {
  for (const mergedBusId of busIdsToUpdate) {
    let ligneBusToUpdate = ligneBus;
    if (mergedBusId !== ligneBus.busId) {
      ligneBusToUpdate = await LigneBusModel.findOne({ busId: mergedBusId, cohort: ligneBus.cohort, deletedAt: { $exists: false } });
    }
    if (ligneBusToUpdate) {
      ligneBusToUpdate.set({ mergedBusIds: newMergedBusIds });
      await ligneBusToUpdate.save();
    }
  }
}
