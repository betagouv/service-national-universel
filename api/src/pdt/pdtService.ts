const { LigneToPointModel, PointDeRassemblementModel, LigneBusModel, CohesionCenterModel } = require("../models");

export async function getInfoBus(line) {
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
    mergedBusDetails = (await LigneBusModel.find({ busId: { $in: line.mergedBusIds } })).map((b) => ({
      _id: b._id,
      busId: b.busId,
      totalCapacity: b.totalCapacity,
      youngSeatsTaken: b.youngSeatsTaken,
      youngCapacity: b.youngCapacity,
    }));
  }

  return { ...line._doc, meetingsPointsDetail, centerDetail, mergedBusDetails };
}

export async function syncMergedBus(ligneBus: any, busIdsToUpdate: string[], newMergedBusIds: string[]) {
  for (const mergedBusId of busIdsToUpdate) {
    let otherMergedLine = ligneBus;
    if (mergedBusId !== ligneBus.busId) {
      otherMergedLine = await LigneBusModel.findOne({ busId: mergedBusId, cohort: ligneBus.cohort });
    }
    if (otherMergedLine) {
      otherMergedLine.set({ mergedBusIds: newMergedBusIds });
      await otherMergedLine.save();
    }
  }
}
