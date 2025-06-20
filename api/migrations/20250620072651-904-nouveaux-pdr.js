const { logger } = require("../src/logger");
const { LigneBusModel, LigneToPointModel, PlanTransportModel, PointDeRassemblementModel } = require("../src/models");

const nouveauPdrByLigneIds = {
  // PDR
  "63ce91e495bf6308d789c96b": {
    // LigneIds
    "6818872786c0277ba168b88f": {
      busArrivalHour: "10:20",
      departureHour: "10:50",
      meetingHour: "10:20",
      returnHour: "12:15",
    },
    "6818871686c0277ba168a3e2": {
      busArrivalHour: "11:40",
      departureHour: "13:20",
      meetingHour: "11:40",
      returnHour: "11:40",
    },
  },
};

module.exports = {
  async up() {
    for (const pdrId of Object.keys(nouveauPdrByLigneIds)) {
      const nouveauPDR = await PointDeRassemblementModel.findById(pdrId);
      if (!nouveauPDR) {
        throw new Error(`PDR ${pdrId} non trouvé`);
      }

      for (const ligneId of Object.keys(nouveauPdrByLigneIds[pdrId])) {
        const ligne = await LigneBusModel.findById(ligneId);
        if (!ligne) {
          throw new Error(`Ligne ${ligneId} non trouvée`);
        }

        ligne.set({
          meetingPointsIds: [...ligne.meetingPointsIds, nouveauPDR._id],
        });
        await ligne.save({ fromUser: { firstName: "904-nouveaux-pdr" } });

        const { _id, ...existingLigneToPoint } = await LigneToPointModel.findOne({ lineId: ligneId }).lean();
        if (!existingLigneToPoint) {
          throw new Error(`LigneToPoint non trouvée pour la ligne ${ligneId}`);
        }

        const ligneToPointToCreate = {
          ...existingLigneToPoint,
          ...nouveauPdrByLigneIds[pdrId][ligneId],
          meetingPointId: nouveauPDR._id,
        };
        await LigneToPointModel.create(ligneToPointToCreate);

        const planTransport = await PlanTransportModel.findById(ligneId);
        if (!planTransport) {
          throw new Error(`PlanTransport non trouvé pour la ligne ${ligneId}`);
        }
        if (planTransport) {
          const pdrToAdd = {
            ...nouveauPDR,
            meetingPointId: nouveauPDR._id,
            transportType: "bus",
            busArrivalHour: ligneToPointToCreate.busArrivalHour,
            departureHour: ligneToPointToCreate.departureHour,
            meetingHour: ligneToPointToCreate.meetingHour,
            returnHour: ligneToPointToCreate.returnHour,
          };
          planTransport.set({ pointDeRassemblements: [...planTransport.pointDeRassemblements, pdrToAdd] });
          await planTransport.save({ fromUser: { firstName: "904-nouveaux-pdr" } });
        }

        logger.info(`Ajout du PDR ${nouveauPDR._id} (${nouveauPDR.matricule}) sur la ligne ${ligneId} (${ligne.busId}) terminé`);
      }
    }
  },

  async down() {
    for (const pdrId of Object.keys(nouveauPdrByLigneIds)) {
      const nouveauPDR = await PointDeRassemblementModel.findById(pdrId);
      if (!nouveauPDR) {
        logger.info(`PDR ${pdrId} non trouvé pour le rollback`);
        continue;
      }

      for (const ligneId of Object.keys(nouveauPdrByLigneIds[pdrId])) {
        const ligne = await LigneBusModel.findById(ligneId);
        if (!ligne) {
          logger.info(`Ligne ${ligneId} non trouvée pour le rollback`);
          continue;
        }

        // Remove PDR from ligne
        ligne.set({
          meetingPointsIds: ligne.meetingPointsIds.filter((id) => id.toString() !== nouveauPDR._id.toString()),
        });
        await ligne.save({ fromUser: { firstName: "904-nouveaux-pdr-rollback" } });

        // Remove LigneToPoint entry
        await LigneToPointModel.deleteOne({ lineId: ligneId, meetingPointId: nouveauPDR._id });

        // Remove PDR from plan de transport
        const planTransport = await PlanTransportModel.findById(ligneId);
        if (planTransport) {
          planTransport.set({
            pointDeRassemblements: planTransport.pointDeRassemblements.filter((pdr) => pdr.meetingPointId.toString() !== nouveauPDR._id.toString()),
          });
          await planTransport.save({ fromUser: { firstName: "904-nouveaux-pdr-rollback" } });
        }

        logger.info(`Suppression du PDR ${nouveauPDR._id} de la ligne ${ligneId} terminée`);
      }
    }
  },
};
