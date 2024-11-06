const { ROLES, SUB_ROLES } = require("snu-lib");
const { EtablissementModel, ReferentModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    // on récupère tous les ids des chefs d'établissements valides
    const etablissements = await EtablissementModel.find({ deletedAt: { $exists: false } }, "referentEtablissementIds");
    const referentIdsInEtablissements = etablissements.reduce((acc, etablissement) => {
      return acc.concat(etablissement.referentEtablissementIds);
    }, []);

    // on récupère tous les ids des chefs d'établissements non rattachés à un établissement
    const referentsNotInEtablissements = await ReferentModel.find({
      role: ROLES.ADMINISTRATEUR_CLE,
      subRole: SUB_ROLES.referent_etablissement,
      deletedAt: { $exists: false },
      _id: { $nin: referentIdsInEtablissements },
    });
    const referentsNotInEtablissementsIDs = [...new Set(referentsNotInEtablissements.map((r) => r._id))];

    // on soft delete tous les rérérents non rattachés à un établissement
    await ReferentModel.updateMany({ _id: { $in: referentsNotInEtablissementsIDs } }, { $set: { deletedAt: new Date() } });
  },
};
