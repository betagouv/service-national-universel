const { LigneBusModel, LigneToPointModel, PlanTransportModel } = require("../src/models");

module.exports = {
  async up() {
    const ligneId = "67ed4e9a322e805767af32ea";
    const meetingPointToDeleteId = "63ebaf4efdb09808c17452b5";
    const ligneNOA163409 = await LigneBusModel.findById(ligneId);
    const existingMeetingPointIdsNOA163409 = ligneNOA163409.meetingPointsIds;
    ligneNOA163409.set({ meetingPointsIds: existingMeetingPointIdsNOA163409.filter((id) => id !== meetingPointToDeleteId) });
    ligneNOA163409.save({ fromUser: { firstName: "693-suppression-pdr" } });

    await LigneToPointModel.deleteOne({ lineId: ligneId, meetingPointId: meetingPointToDeleteId });

    const planTransport = await PlanTransportModel.findById(ligneId);
    const existingMeetingPointIds = planTransport.pointDeRassemblements;
    planTransport.set({ pointDeRassemblements: existingMeetingPointIds.filter((pdr) => pdr.meetingPointId !== meetingPointToDeleteId) });
    planTransport.save({ fromUser: { firstName: "693-suppression-pdr" } });
  },
};
