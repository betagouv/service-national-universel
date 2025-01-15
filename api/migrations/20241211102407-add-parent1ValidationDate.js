const { logger } = require("../src/logger");
const { YoungModel } = require("../src/models");
const { REGLEMENT_INTERIEUR_VERSION } = require("snu-lib");

module.exports = {
  async up(db, client) {
    try {
      logger.info("Migration UP: Mise à jour des jeunes avec acceptRI mais sans parent1ValidationDate...");

      const where = {
        acceptRI: REGLEMENT_INTERIEUR_VERSION,
        parent1ValidationDate: { $exists: false },
      };

      // Récupérez les jeunes concernés
      const cursor = YoungModel.find(where).cursor();

      let countTotal = 0;
      let countUpdated = 0;

      // Utilisation de `eachAsync` pour itérer sur les jeunes
      await cursor.eachAsync(async (young) => {
        countTotal++;
        // Recherchez un patch lié au jeune avec une opération ayant le chemin "/acceptRI"
        const patch = await db.collection("young_patches").findOne({
          ref: young._id,
          ops: { $elemMatch: { path: "/acceptRI" } },
        });

        if (patch) {
          const opsEntry = patch.ops.find((op) => op.path === "/acceptRI");
          if (opsEntry) {
            const modificationDate = patch.date;
            young.set({ parent1ValidationDate: modificationDate });
            await young.save({ fromUser: { firstName: "Migration acceptRI" } });
            countUpdated++;
            logger.info(`Mise à jour réussie : youngId=${young._id}, parent1ValidationDate=${modificationDate.toString()}`);
          }
        } else {
          logger.info(`Aucun patch trouvé pour youngId=${young._id}`);
        }
      });

      logger.info(`${countTotal} jeunes traités. ${countUpdated} mises à jour effectuées.`);
    } catch (error) {
      logger.error("Erreur pendant la migration UP :", error);
      throw error;
    }
  },
};
