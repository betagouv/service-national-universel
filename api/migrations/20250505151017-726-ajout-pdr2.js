const { LigneBusModel, LigneToPointModel, PlanTransportModel, PointDeRassemblementModel } = require("../src/models");

const pdrAC003004Id = "63c1457b68d789062c836275";
const ligneARA031073Id = "67ed4e86322e805767af1925";
const ligneARA031261Id = "67ed4e86322e805767af194a";
const ligneARA031733Id = "67ed4e86322e805767af196d";

module.exports = {
  async up() {
    const pdrAC003004 = await PointDeRassemblementModel.findById(pdrAC003004Id).lean();
    const pdrToAdd = {
      ...pdrAC003004,
      meetingPointId: pdrAC003004Id,
    };

    const ligneARA031073 = await LigneBusModel.findById(ligneARA031073Id);
    const existingMeetingPointIdsARA031073 = ligneARA031073.meetingPointsIds;
    ligneARA031073.set({ meetingPointsIds: [...existingMeetingPointIdsARA031073, pdrAC003004Id] });
    ligneARA031073.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });
    const ligneToBusARA031073 = await LigneToPointModel.findOne({ lineId: ligneARA031073Id }).lean();
    await LigneToPointModel.create({ ...ligneToBusARA031073, _id: undefined, meetingPointId: pdrAC003004Id });
    const planTransport = await PlanTransportModel.findById(ligneARA031073Id);
    const existingMeetingPointIds = planTransport.pointDeRassemblements;
    planTransport.set({ pointDeRassemblements: [...existingMeetingPointIds, pdrToAdd] });
    planTransport.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });

    const ligneARA031261 = await LigneBusModel.findById(ligneARA031261Id);
    const existingMeetingPointIdsARA031261 = ligneARA031261.meetingPointsIds;
    ligneARA031261.set({ meetingPointsIds: [...existingMeetingPointIdsARA031261, pdrAC003004Id] });
    ligneARA031261.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });
    const ligneToBusARA031261 = await LigneToPointModel.findOne({ lineId: ligneARA031261Id }).lean();
    await LigneToPointModel.create({ ...ligneToBusARA031261, _id: undefined, meetingPointId: pdrAC003004Id });
    const planTransport2 = await PlanTransportModel.findById(ligneARA031261Id);
    const existingMeetingPointIds2 = planTransport2.pointDeRassemblements;
    planTransport2.set({ pointDeRassemblements: [...existingMeetingPointIds2, pdrToAdd] });
    planTransport2.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });

    const ligneARA031733 = await LigneBusModel.findById(ligneARA031733Id);
    const existingMeetingPointIdsARA031733 = ligneARA031733.meetingPointsIds;
    ligneARA031733.set({ meetingPointsIds: [...existingMeetingPointIdsARA031733, pdrAC003004Id] });
    ligneARA031733.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });
    const ligneToBusARA031733 = await LigneToPointModel.findOne({ lineId: ligneARA031733Id }).lean();
    await LigneToPointModel.create({ ...ligneToBusARA031733, _id: undefined, meetingPointId: pdrAC003004Id });
    const planTransport3 = await PlanTransportModel.findById(ligneARA031733Id);
    const existingMeetingPointIds3 = planTransport3.pointDeRassemblements;
    planTransport3.set({ pointDeRassemblements: [...existingMeetingPointIds3, pdrToAdd] });
    planTransport3.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });
  },

  async down() {
    // Remove AC003004 from ARA031073
    const ligneARA031073 = await LigneBusModel.findById(ligneARA031073Id);
    ligneARA031073.set({ meetingPointsIds: ligneARA031073.meetingPointsIds.filter((id) => id !== pdrAC003004Id) });
    ligneARA031073.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });
    await LigneToPointModel.deleteOne({ lineId: ligneARA031073Id, meetingPointId: pdrAC003004Id });
    const planTransport = await PlanTransportModel.findById(ligneARA031073Id);
    const existingMeetingPointIds = planTransport.pointDeRassemblements;
    planTransport.set({ pointDeRassemblements: existingMeetingPointIds.filter((pdr) => pdr.meetingPointId !== pdrAC003004Id) });
    planTransport.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });

    // Remove AC003004 from ARA031261
    const ligneARA031261 = await LigneBusModel.findById(ligneARA031261Id);
    ligneARA031261.set({ meetingPointsIds: ligneARA031261.meetingPointsIds.filter((id) => id !== pdrAC003004Id) });
    ligneARA031261.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });
    await LigneToPointModel.deleteOne({ lineId: ligneARA031261Id, meetingPointId: pdrAC003004Id });
    const planTransport2 = await PlanTransportModel.findById(ligneARA031261Id);
    const existingMeetingPointIds2 = planTransport2.pointDeRassemblements;
    planTransport2.set({ pointDeRassemblements: existingMeetingPointIds2.filter((pdr) => pdr.meetingPointId !== pdrAC003004Id) });
    planTransport2.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });

    // Remove AC003004 from ARA031733
    const ligneARA031733 = await LigneBusModel.findById(ligneARA031733Id);
    ligneARA031733.set({ meetingPointsIds: ligneARA031733.meetingPointsIds.filter((id) => id !== pdrAC003004Id) });
    ligneARA031733.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });
    await LigneToPointModel.deleteOne({ lineId: ligneARA031733Id, meetingPointId: pdrAC003004Id });
    const planTransport3 = await PlanTransportModel.findById(ligneARA031733Id);
    const existingMeetingPointIds3 = planTransport3.pointDeRassemblements;
    planTransport3.set({ pointDeRassemblements: existingMeetingPointIds3.filter((pdr) => pdr.meetingPointId !== pdrAC003004Id) });
    planTransport3.save({ fromUser: { firstName: "726-ajout-pdr2-sur-lignes" } });
  },
};
