const { logger } = require("../src/logger");
const { YoungModel, ClasseModel, EtablissementModel } = require("../src/models");

module.exports = {
  async up() {
    const cleYoungs = await YoungModel.find({ source: "CLE", schoolDepartment: "" });
    logger.info(`Found ${cleYoungs.length} CLE youngs with empty schoolDepartment...`);

    for (const young of cleYoungs) {
      // Récupérer la classe associée
      if (!young.classeId) {
        logger.info(`Young ${young._id} has no classeId, skipping...`);
        continue;
      }

      const classe = await ClasseModel.findById(young.classeId);
      if (!classe) {
        logger.info(`Classe ${young.classeId} not found for Young ${young._id}, skipping...`);
        continue;
      }

      // Récupérer l'établissement associé à la classe
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) {
        logger.info(`Etablissement ${classe.etablissementId} not found for Classe ${classe._id}, skipping...`);
        continue;
      }

      // Mettre à jour les informations du jeune
      const updateData = {
        schoolName: etablissement.name,
        schoolType: etablissement.type[0],
        schoolAddress: etablissement.address,
        schoolZip: etablissement.zip,
        schoolCity: etablissement.city,
        schoolDepartment: etablissement.department,
        schoolRegion: etablissement.region,
        schoolCountry: etablissement.country,
        schoolId: etablissement.schoolId,
      };

      await YoungModel.updateOne({ _id: young._id }, { $set: updateData });
      logger.info(`Updated Young ${young._id} with school information.`);
    }
  },

  async down() {
    // Trouver tous les jeunes CLE pour lesquels la migration a été appliquée
    const cleYoungsToReset = await YoungModel.find({ source: "CLE" });
    logger.info(`Found ${cleYoungsToReset.length} CLE youngs to reset school fields...`);

    // Remettre les champs à une chaîne vide
    for (const young of cleYoungsToReset) {
      const resetData = {
        schoolName: "",
        schoolType: "",
        schoolAddress: "",
        schoolZip: "",
        schoolCity: "",
        schoolDepartment: "",
        schoolRegion: "",
        schoolCountry: "",
        schoolId: "",
      };

      await YoungModel.updateOne({ _id: young._id }, { $set: resetData });
      logger.info(`Reset school fields for Young ${young._id}.`);
    }
  },
};
