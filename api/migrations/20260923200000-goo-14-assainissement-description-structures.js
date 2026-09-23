const mongoose = require("mongoose");
const { sanitizeStoredHtml } = require("snu-lib");
const { logger } = require("../src/logger");

/**
 * GOO-14 (FH1) — assainissement des descriptions de structure déjà en base.
 *
 * La description est rendue en HTML sur la fiche mission de moncompte. Le rendu passe désormais par
 * `htmlCleaner` et l'écriture par `sanitizeStoredHtml`, mais les descriptions saisies avant (dans
 * l'admin ou reprises de JeVeuxAider) peuvent encore porter du balisage actif. On leur applique la
 * même liste blanche qu'à l'écriture ; un texte sans balisage n'est pas touché.
 */
module.exports = {
  async up() {
    const collection = mongoose.connection.db.collection("structures");
    const cursor = collection.find({ description: /</ }, { projection: { description: 1 } });
    let examinees = 0;
    let modifiees = 0;
    for await (const structure of cursor) {
      examinees++;
      const description = sanitizeStoredHtml(structure.description);
      if (description === structure.description) continue;
      await collection.updateOne({ _id: structure._id }, { $set: { description, updatedAt: new Date() } });
      modifiees++;
    }
    logger.info(`GOO-14 - structures : ${examinees} descriptions balisées examinées, ${modifiees} assainies`);
  },

  async down() {
    // Assainissement de contenu : irréversible par conception, le balisage retiré ne doit pas revenir.
    logger.info("GOO-14 - assainissement des descriptions de structure : pas de rollback");
  },
};
