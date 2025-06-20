const { logger } = require("../src/logger");
const { LigneBusModel, LigneToPointModel, PlanTransportModel, PointDeRassemblementModel } = require("../src/models");

const nouveauPdrByLigneIds = {
  // PDR
  "63caa1bcf3d20208cd5b5d03": {
    // LigneIds
    "6818872886c0277ba168b95a": {
      busArrivalHour: "09:30",
      departureHour: "10:00",
      meetingHour: "09:30",
      returnHour: "14:45",
    },
    "6818872086c0277ba168af87": {
      busArrivalHour: "09:30",
      departureHour: "10:00",
      meetingHour: "10:00",
      returnHour: "14:45",
    },
    "6818871786c0277ba168a551": {
      busArrivalHour: "10:00",
      departureHour: "10:30",
      meetingHour: "10:00",
      returnHour: "14:30",
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
        await ligne.save({ fromUser: { firstName: "909-pdr2-rajouter" } });

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
          await planTransport.save({ fromUser: { firstName: "909-pdr2-rajouter" } });
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
        await ligne.save({ fromUser: { firstName: "909-pdr2-rajouter-rollback" } });

        // Remove LigneToPoint entry
        await LigneToPointModel.deleteOne({ lineId: ligneId, meetingPointId: nouveauPDR._id });

        // Remove PDR from plan de transport
        const planTransport = await PlanTransportModel.findById(ligneId);
        if (planTransport) {
          planTransport.set({
            pointDeRassemblements: planTransport.pointDeRassemblements.filter((pdr) => pdr.meetingPointId.toString() !== nouveauPDR._id.toString()),
          });
          await planTransport.save({ fromUser: { firstName: "909-pdr2-rajouter-rollback" } });
        }

        logger.info(`Suppression du PDR ${nouveauPDR._id} de la ligne ${ligneId} terminée`);
      }
    }
  },
};
