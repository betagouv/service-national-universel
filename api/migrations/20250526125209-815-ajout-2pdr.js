const { LigneBusModel, LigneToPointModel, PointDeRassemblementModel } = require("../src/models");

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
      const ligneToBus = await LigneToPointModel.findOne({ lineId: ligneId }).lean();
      if (!ligneToBus) {
        throw new Error(`LigneToPoint non trouvée pour la ligne ${ligneId}`);
      }

      ligne.set({
        meetingPointsIds: [...ligne.meetingPointsIds, nouveauPDR._id],
      });
      ligne.save({ fromUser: { firstName: "815-ajout-pdr2-sur-lignes" } });

      await LigneToPointModel.create({ ...ligneToBus, _id: undefined, meetingPointId: nouveauPDR._id });
      console.log(`Ajout du PDR ${nouveauPDRid} (${nouveauPDR.matricule}) sur la ligne ${ligneId} (${ligne.busId}) terminé`);
    }
  },

  async down(db, client) {
    const nouveauPDR = await PointDeRassemblementModel.findById(nouveauPDRid);

    for (const ligneId of ligneIds) {
      const ligne = await LigneBusModel.findById(ligneId);

      ligne.set({
        meetingPointsIds: ligne.meetingPointsIds.filter((id) => id !== nouveauPDR._id),
      });
      ligne.save({ fromUser: { firstName: "815-ajout-pdr2-sur-lignes" } });

      await LigneToPointModel.deleteOne({ lineId: ligneId, meetingPointId: nouveauPDR._id });
    }
  },
};
