const { YoungModel } = require("../src/models");
const { logger } = require("../src/logger");

/**
 * Décommissionnement du parcours des représentants légaux : effacement des jetons parents.
 *
 * `parentXInscription2023Token` était la seule authentification des routes `/representants-legaux/*`,
 * supprimées avec les pages de consentement, de droit à l'image et de règlement intérieur. Les jetons
 * n'ouvrent plus rien, mais restent des secrets en clair : ils sont retirés de la base.
 *
 * Écriture par le driver (`collection.updateMany`) : ni hook `save`, ni patch d'historique, ni
 * synchronisation Brevo. Les jetons étaient déjà exclus de l'historique (H56).
 */
const TOKEN_FIELDS = ["parent1Inscription2023Token", "parent2Inscription2023Token", "parent1Inscription2023TokenExpiresAt", "parent2Inscription2023TokenExpiresAt"];

module.exports = {
  async up() {
    const filter = { $or: TOKEN_FIELDS.map((field) => ({ [field]: { $exists: true } })) };
    const unset = Object.fromEntries(TOKEN_FIELDS.map((field) => [field, ""]));
    const { matchedCount, modifiedCount } = await YoungModel.collection.updateMany(filter, { $unset: unset });
    logger.info(`Décommissionnement représentants légaux - jetons parents effacés : ${modifiedCount} volontaires modifiés sur ${matchedCount}`);
  },

  async down() {
    // Effacement de secrets : irréversible par conception, les jetons ne doivent pas être restaurés.
    logger.info("Décommissionnement représentants légaux - jetons parents : pas de rollback");
  },
};
