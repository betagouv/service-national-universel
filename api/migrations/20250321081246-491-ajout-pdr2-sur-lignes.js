const { LigneBusModel, LigneToPointModel } = require("../src/models");

const pdrAGO38Id = "63ce91e495bf6308d789c96b";
const pdrAC003Id = "63c1457b68d789062c836275";
const ligneARA031431Id = "67c1c28ba1c77e7e0263ed28";
const ligneARA382431Id = "67c1c28ca1c77e7e0263eddc";
const ligneARA382698Id = "67c1c28da1c77e7e0263ee6f";

module.exports = {
  async up() {
    // pdr: ARC003
    const ligneARA031431 = await LigneBusModel.findById(ligneARA031431Id);
    const existingMeetingPointIdsARA031431 = ligneARA031431.meetingPointsIds;
    ligneARA031431.set({ meetingPointsIds: [...existingMeetingPointIdsARA031431, pdrAC003Id] });
    ligneARA031431.save({ fromUser: { firstName: "491-ajout-pdr2-sur-lignes" } });
    const ligneToBusARA031431 = await LigneToPointModel.findOne({ lineId: ligneARA031431Id }).lean();
    await LigneToPointModel.create({ ...ligneToBusARA031431, _id: undefined, meetingPointId: pdrAC003Id });

    // pdr: AGO38
    const ligneARA382431 = await LigneBusModel.findById(ligneARA382431Id);
    const existingMeetingPointIdsARA382431 = ligneARA382431.meetingPointsIds;
    ligneARA382431.set({ meetingPointsIds: [...existingMeetingPointIdsARA382431, pdrAGO38Id] });
    ligneARA382431.save({ fromUser: { firstName: "491-ajout-pdr2-sur-lignes" } });
    const ligneToBusARA382431 = await LigneToPointModel.findOne({ lineId: ligneARA382431Id }).lean();
    await LigneToPointModel.create({ ...ligneToBusARA382431, _id: undefined, meetingPointId: pdrAGO38Id });

    const ligneARA382698 = await LigneBusModel.findById(ligneARA382698Id);
    const existingMeetingPointIdsARA382698 = ligneARA382698.meetingPointsIds;
    ligneARA382698.set({ meetingPointsIds: [...existingMeetingPointIdsARA382698, pdrAGO38Id] });
    ligneARA382698.save({ fromUser: { firstName: "491-ajout-pdr2-sur-lignes" } });
    const ligneToBusARA382698 = await LigneToPointModel.findOne({ lineId: ligneARA382698Id }).lean();
    await LigneToPointModel.create({ ...ligneToBusARA382698, _id: undefined, meetingPointId: pdrAGO38Id });
  },

  async down() {
    // Remove ARC003 from ARA031431
    const ligneARA031431 = await LigneBusModel.findById(ligneARA031431Id);
    ligneARA031431.set({ meetingPointsIds: ligneARA031431.meetingPointsIds.filter((id) => id !== pdrAC003Id) });
    ligneARA031431.save({ fromUser: { firstName: "491-ajout-pdr2-sur-lignes" } });
    await LigneToPointModel.deleteOne({ lineId: ligneARA031431Id, meetingPointId: pdrAC003Id });

    // Remove AGO38 from ARA382431
    const ligneARA382431 = await LigneBusModel.findById(ligneARA382431Id);
    ligneARA382431.set({ meetingPointsIds: ligneARA382431.meetingPointsIds.filter((id) => id !== pdrAGO38Id) });
    ligneARA382431.save({ fromUser: { firstName: "491-ajout-pdr2-sur-lignes" } });
    await LigneToPointModel.deleteOne({ lineId: ligneARA382431Id, meetingPointId: pdrAGO38Id });

    // Remove AGO38 from ARA382698
    const ligneARA382698 = await LigneBusModel.findById(ligneARA382698Id);
    ligneARA382698.set({ meetingPointsIds: ligneARA382698.meetingPointsIds.filter((id) => id !== pdrAGO38Id) });
    ligneARA382698.save({ fromUser: { firstName: "491-ajout-pdr2-sur-lignes" } });
    await LigneToPointModel.deleteOne({ lineId: ligneARA382698Id, meetingPointId: pdrAGO38Id });
  },
};
