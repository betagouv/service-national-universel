const mongoose = require("mongoose");
const { logger } = require("../src/logger");

/**
 * H56 — purge des secrets déjà enregistrés dans l'historique (`*_patches`).
 *
 * Les plugins `patchHistory` excluent désormais ces champs à l'écriture, mais les patches écrits avant
 * portent encore la valeur en clair. Les jetons parents (`parentXInscription2023Token`) sont des bearer
 * sans expiration : ils restent exploitables tant qu'ils sont en base.
 *
 * Les dates d'expiration et les compteurs de tentatives ne sont pas des secrets : ils sont conservés.
 */
const SECRET_PATHS = [
  "/password",
  "/parent1Inscription2023Token",
  "/parent2Inscription2023Token",
  "/tokenEmailValidation",
  "/token2FA",
  "/forgotPasswordResetToken",
  "/invitationToken",
  "/phase3Token",
];

const COLLECTIONS = ["young_patches", "referent_patches"];

async function purge(collectionName) {
  const collection = mongoose.connection.db.collection(collectionName);
  const concernes = await collection.countDocuments({ "ops.path": { $in: SECRET_PATHS } });
  if (concernes === 0) {
    logger.info(`H56 - ${collectionName} : aucun patch à purger`);
    return;
  }
  const { modifiedCount } = await collection.updateMany({ "ops.path": { $in: SECRET_PATHS } }, { $pull: { ops: { path: { $in: SECRET_PATHS } } } });
  // Un patch qui ne portait qu'un secret n'a plus rien à afficher.
  const { deletedCount } = await collection.deleteMany({ ops: { $size: 0 } });
  logger.info(`H56 - ${collectionName} : ${modifiedCount} patchs purgés, ${deletedCount} patchs vidés supprimés`);
}

module.exports = {
  async up() {
    for (const collection of COLLECTIONS) {
      await purge(collection);
    }
  },

  async down() {
    // Purge de secrets : irréversible par conception, les valeurs ne doivent pas être restaurées.
    logger.info("H56 - purge des secrets de l'historique : pas de rollback");
  },
};
