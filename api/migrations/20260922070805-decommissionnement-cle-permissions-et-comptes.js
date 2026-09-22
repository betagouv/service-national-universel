const { logger } = require("../src/logger");
const { PermissionModel } = require("../src/models/permissions/permission");
const { ReferentModel } = require("../src/models");
const { ROLES, ReferentStatus } = require("snu-lib");

const CLE_ROLES = [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE];

module.exports = {
  async up() {
    logger.info("Décommissionnement CLE - retrait des rôles CLE des permissions");
    const pullResult = await PermissionModel.updateMany({ roles: { $in: CLE_ROLES } }, { $pull: { roles: { $in: CLE_ROLES } } });
    logger.info(`Décommissionnement CLE - ${pullResult.modifiedCount} permission(s) mise(s) à jour`);

    const emptied = await PermissionModel.find({ roles: { $size: 0 } });
    logger.info(`Décommissionnement CLE - ${emptied.length} permission(s) sans rôle restant : ${emptied.map((p) => p.code).join(", ") || "aucune"}`);
    await PermissionModel.deleteMany({ roles: { $size: 0 } });

    logger.info("Décommissionnement CLE - désactivation des comptes CLE restants");
    const stillActive = await ReferentModel.find({
      role: { $in: CLE_ROLES },
      status: { $ne: ReferentStatus.INACTIVE },
    }).cursor({ batchSize: 100 });

    let deactivated = 0;
    // patch library mix up _id when using updatemany and bulk update, so we use a cursor and findByIdAndUpdate instead
    await stillActive.eachAsync(
      async (referent) => {
        await ReferentModel.findByIdAndUpdate({ _id: referent._id }, { $set: { status: ReferentStatus.INACTIVE } }, { new: false });
        deactivated += 1;
      },
      { parallel: 10 },
    );
    logger.info(`Décommissionnement CLE - ${deactivated} compte(s) désactivé(s) (0 attendu)`);
  },

  async down() {
    logger.info("Décommissionnement CLE - pas de retour arrière automatique");
    // Le retour arrière se fait en rejouant les seeds de permissions concernés.
    // Les comptes CLE ne sont pas réactivés : ils étaient déjà INACTIVE avant cette migration
    // (voir 20250804095717-987-desactiver-comptes.js).
  },
};
