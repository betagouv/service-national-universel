const { FeatureFlagModel } = require("../src/models");
const { FeatureFlagName } = require("snu-lib");

module.exports = {
  async up() {
    await FeatureFlagModel.create({
      name: FeatureFlagName.BANDEAU_CONSENTEMENT_NON_ELIGIBLES,
      description: "Affichage du bandeau d'information des volontaires non éligibles (campagne de recueil du consentement liée à la fermeture de la plateforme fin 2026)",
      enabled: true,
    });
  },

  async down() {
    await FeatureFlagModel.deleteOne({ name: FeatureFlagName.BANDEAU_CONSENTEMENT_NON_ELIGIBLES });
  },
};
