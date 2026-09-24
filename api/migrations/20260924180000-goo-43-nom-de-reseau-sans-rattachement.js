const mongoose = require("mongoose");
const { logger } = require("../src/logger");

/**
 * GOO-43 — noms de réseau sans rattachement.
 *
 * Depuis février 2023 (#2287), l'API retirait `networkId` du corps d'un PUT /structure envoyé par un non-admin mais
 * gardait `networkName` : la fiche affichait un réseau auquel la structure n'était pas rattachée. On vide ce nom
 * orphelin ; l'API le déduit désormais du seul rattachement. Les structures corrigées sont listées dans les logs
 * pour qu'un administrateur puisse les rattacher s'il y a lieu (le nom choisi reste dans l'historique des patches).
 */
const ORPHAN_FILTER = {
  networkName: { $nin: [null, ""] },
  networkId: { $in: [null, ""] },
  isNetwork: { $ne: "true" },
};

module.exports = {
  async up() {
    const collection = mongoose.connection.db.collection("structures");
    const orphans = await collection.find(ORPHAN_FILTER, { projection: { name: 1, networkName: 1 } }).toArray();
    for (const structure of orphans) {
      logger.info(`GOO-43 - structure ${structure._id} (${structure.name}) : nom de réseau "${structure.networkName}" sans rattachement, vidé`);
    }
    if (orphans.length) {
      await collection.updateMany({ _id: { $in: orphans.map((s) => s._id) } }, { $set: { networkName: "", updatedAt: new Date() } });
    }
    logger.info(`GOO-43 - structures : ${orphans.length} noms de réseau sans rattachement vidés`);
  },

  async down() {
    // Correction de données : le nom orphelin reste consultable dans l'historique des patches de chaque structure.
    logger.info("GOO-43 - noms de réseau sans rattachement : pas de rollback");
  },
};
