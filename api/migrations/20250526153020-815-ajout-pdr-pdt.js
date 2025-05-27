const { LigneBusModel, LigneToPointModel, PlanTransportModel, PointDeRassemblementModel } = require("../src/models");

const nouveauPDRid = "63caa1bcf3d20208cd5b5d03";
const ligneIds = ["67ed4e7b322e805767af0b84", "67ed4e7c322e805767af0bbc", "67ed4e7c322e805767af0bcf"];
module.exports = {
  async up(db, client) {
    const nouveauPDR = await PointDeRassemblementModel.findById(nouveauPDRid);
    if (!nouveauPDR) {
      throw new Error(`PDR ${nouveauPDRid} non trouvé`);
    }
    for (const ligneId of ligneIds) {
      const ligne = await LigneBusModel.findById(ligneId);
      if (!ligne) {
        throw new Error(`Ligne ${ligneId} non trouvée`);
      }
      const ligneToPoint = await LigneToPointModel.findOne({ lineId: ligneId }).lean();
      if (!ligneToPoint) {
        throw new Error(`LigneToPoint non trouvée pour la ligne ${ligneId}`);
      }

      const planTransport = await PlanTransportModel.findById(ligne);
      const pdrToAdd = {
        ...nouveauPDR,
        meetingPointId: nouveauPDRid,
        transportType: "bus",
        busArrivalHour: ligneToPoint.busArrivalHour,
        departureHour: ligneToPoint.departureHour,
        meetingHour: ligneToPoint.meetingHour,
        returnHour: ligneToPoint.returnHour,
      };
      planTransport.set({ pointDeRassemblements: [...planTransport.pointDeRassemblements, pdrToAdd] });
      await planTransport.save({ fromUser: { firstName: "815-ajout-pdr-pdt" } });
    }
  },

  async down(db, client) {
    for (const ligneId of ligneIds) {
      const ligne = await LigneBusModel.findById(ligneId);
      if (!ligne) {
        throw new Error(`Ligne ${ligneId} non trouvée`);
      }
      const planTransport = await PlanTransportModel.findById(ligne);
      if (!planTransport) {
        throw new Error(`PlanTransport non trouvé pour la ligne ${ligneId}`);
      }
      planTransport.set({ pointDeRassemblements: planTransport.pointDeRassemblements.filter((pdr) => pdr.meetingPointId !== nouveauPDRid) });
      await planTransport.save({ fromUser: { firstName: "815-ajout-pdr-pdt" } });
    }
  },
};
