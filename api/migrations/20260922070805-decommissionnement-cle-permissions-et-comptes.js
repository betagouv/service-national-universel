const { logger } = require("../src/logger");
const { PermissionModel } = require("../src/models/permissions/permission");
const { ReferentModel } = require("../src/models");
const { ROLES, ReferentStatus, PERMISSION_CODES, PERMISSION_RESOURCES, PERMISSION_ACTIONS } = require("snu-lib");

const CLE_ROLES = [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE];

// Relevé sur l'état des migrations de seed de permissions au moment de l'écriture de cette migration :
// pour chaque `PermissionModel.create` de api/migrations/*.js, examen du champ `roles`, qu'il énumère
// des rôles littéralement (ROLES.ADMINISTRATEUR_CLE / ROLES.REFERENT_CLASSE) ou qu'il soit une liste de
// rôles calculée (ROLES_LIST, REFERENT_AND_JEUNE_ROLES_LIST, cf. packages/lib/src/roles.ts:150-151, qui
// contiennent toutes deux les rôles CLE) :
//   - api/migrations/20250424085300-seed-injep-permissions.js (PROFILE: ROLES_LIST, SUPPORT_WRITE: REFERENT_AND_JEUNE_ROLES_LIST)
//   - api/migrations/20250624122150-seed-responsable-permissions.js (dont COHORT_READ: ROLES_LIST)
//   - api/migrations/20250716091433-763-seed-supervisor-permissions.js
//   - api/migrations/20250723094011-980-permissions-export-read.js
//   - api/migrations/20250801060707-916-permissions-supervisor.js
// Aucune autre migration ne crée de PermissionModel avec une liste de rôles dérivée (spread/filter/concat)
// et aucune permission n'est créée ailleurs que par PermissionModel.create dans une migration (pas
// d'insertMany, pas d'upsert, pas de seed applicatif hors migrations : cf. rapport de tâche 6, ronde 2).
// Ces deux constantes sont la trace opérationnelle du retour arrière : down() ne devine rien depuis
// l'état de la base au moment où il tourne, il rejoue l'inverse de ce qui est figé ici.

// Permissions dont le tableau `roles` mélange rôles CLE et rôles non-CLE : up() ne fait que retirer
// les rôles CLE, ces documents survivent. down() peut donc les restaurer par un simple $addToSet
// des deux rôles CLE, en les repérant par leur `code`.
const AMPUTATED_PERMISSION_CODES = [
  PERMISSION_CODES.INSCRIPTION_READ,
  PERMISSION_CODES.USER_NOTIFICATIONS_READ,
  PERMISSION_CODES.USER_HISTORY_READ,
  PERMISSION_CODES.ALERTE_MESSAGE_READ,
  PERMISSION_CODES.ETABLISSEMENT_READ,
  PERMISSION_CODES.POINT_DE_RASSEMBLEMENT_READ,
  PERMISSION_CODES.ACCUEIL_READ,
  PERMISSION_CODES.CLASSE_READ,
  PERMISSION_CODES.COHORT_READ, // roles: ROLES_LIST (tous les rôles, dont les deux rôles CLE)
  PERMISSION_CODES.EXPORT_READ,
  PERMISSION_CODES.PATCHES_READ,
  PERMISSION_CODES.PROFILE, // roles: ROLES_LIST (tous les rôles, dont les deux rôles CLE)
  PERMISSION_CODES.SUPPORT_WRITE, // roles: REFERENT_AND_JEUNE_ROLES_LIST (idem + ROLE_JEUNE)
];

// Permissions dont le tableau `roles` ne contient QUE des rôles CLE : up() les supprime entièrement
// ($pull vide le tableau, puis deleteMany sur { roles: { $size: 0 } }). Leur définition d'origine est
// reprise ici telle qu'elle a été seedée, pour permettre à down() de les recréer à l'identique.
// Les quatre définitions ci-dessous ont pu être reconstruites fidèlement à partir des migrations de
// seed listées plus haut (titre, resource, action, roles et policy y sont explicites) : aucune n'a dû
// être approximée.
const DELETED_PERMISSIONS = [
  {
    code: PERMISSION_CODES.YOUNG_CREATE_ETABLISSEMENT,
    titre: "Invitation d'élèves dans son établissement",
    resource: PERMISSION_RESOURCES.YOUNG,
    action: PERMISSION_ACTIONS.CREATE,
    roles: [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    policy: { where: [{ field: "etablissementId", source: "etablissementId" }] },
  },
  {
    code: PERMISSION_CODES.CANDIDATURE_CLE + PERMISSION_ACTIONS.READ,
    titre: "Lecture sur les candidatures CLE",
    resource: PERMISSION_RESOURCES.APPLICATION,
    action: PERMISSION_ACTIONS.READ,
    roles: [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE],
    policy: { where: [{ resource: "young", field: "source", value: "CLE" }] },
  },
  {
    code: PERMISSION_CODES.CANDIDATURE_CLE + PERMISSION_ACTIONS.WRITE,
    titre: "Lecture sur les candidatures CLE",
    resource: PERMISSION_RESOURCES.APPLICATION,
    action: PERMISSION_ACTIONS.WRITE,
    roles: [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE],
    policy: { where: [{ resource: "young", field: "source", value: "CLE" }] },
  },
  {
    code: PERMISSION_CODES.CANDIDATURE_CLE + PERMISSION_ACTIONS.CREATE,
    titre: "Lecture sur les candidatures CLE",
    resource: PERMISSION_RESOURCES.APPLICATION,
    action: PERMISSION_ACTIONS.CREATE,
    roles: [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE],
    policy: { where: [{ resource: "young", field: "source", value: "CLE" }] },
  },
];

module.exports = {
  async up() {
    logger.info("Décommissionnement CLE - retrait des rôles CLE des permissions");

    // Relevé, avant toute écriture, de l'état réel de la base : quels documents portent un rôle CLE,
    // et lesquels vont être vidés (roles exclusivement CLE) plutôt que simplement amputés. Ce relevé
    // est la trace opérationnelle du retour arrière ; il permet aussi de vérifier, log à l'appui, que
    // les constantes figées ci-dessus correspondent bien à l'état réel au moment du run.
    const affected = await PermissionModel.find({ roles: { $in: CLE_ROLES } });
    const toBeEmptied = affected.filter((p) => p.roles.every((role) => CLE_ROLES.includes(role))).map((p) => p.code);
    const toBeAmputated = affected.filter((p) => !p.roles.every((role) => CLE_ROLES.includes(role))).map((p) => p.code);
    logger.info(`Décommissionnement CLE - permissions qui seront amputées des rôles CLE (${toBeAmputated.length}) : ${toBeAmputated.join(", ") || "aucune"}`);
    logger.info(`Décommissionnement CLE - permissions exclusivement CLE qui seront supprimées (${toBeEmptied.length}) : ${toBeEmptied.join(", ") || "aucune"}`);

    const pullResult = await PermissionModel.updateMany({ roles: { $in: CLE_ROLES } }, { $pull: { roles: { $in: CLE_ROLES } } });
    logger.info(`Décommissionnement CLE - ${pullResult.modifiedCount} permission(s) mise(s) à jour`);

    // Restreint au périmètre relevé plus haut (toBeEmptied) : un document déjà roles: [] pour une
    // raison étrangère à cette migration ne doit pas être supprimé, down() ne saurait pas le recréer.
    const emptied = await PermissionModel.find({ code: { $in: toBeEmptied }, roles: { $size: 0 } });
    logger.info(`Décommissionnement CLE - ${emptied.length} permission(s) sans rôle restant : ${emptied.map((p) => p.code).join(", ") || "aucune"}`);
    await PermissionModel.deleteMany({ code: { $in: toBeEmptied }, roles: { $size: 0 } });

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
    logger.info("Décommissionnement CLE - retour arrière : réintégration des rôles CLE sur les permissions amputées");
    const addBackResult = await PermissionModel.updateMany({ code: { $in: AMPUTATED_PERMISSION_CODES } }, { $addToSet: { roles: { $each: CLE_ROLES } } });
    logger.info(`Décommissionnement CLE - ${addBackResult.modifiedCount} permission(s) restaurée(s) sur ${AMPUTATED_PERMISSION_CODES.length} attendue(s)`);

    logger.info("Décommissionnement CLE - retour arrière : recréation des permissions exclusivement CLE");
    let recreated = 0;
    for (const definition of DELETED_PERMISSIONS) {
      const exists = await PermissionModel.findOne({ code: definition.code });
      if (exists) continue;
      await PermissionModel.create(definition);
      recreated += 1;
    }
    logger.info(`Décommissionnement CLE - ${recreated} permission(s) recréée(s) sur ${DELETED_PERMISSIONS.length} attendue(s)`);

    // Les comptes CLE ne sont pas réactivés : ils étaient déjà INACTIVE avant cette migration
    // (voir 20250804095717-987-desactiver-comptes.js).
    logger.info("Décommissionnement CLE - pas de réactivation des comptes (déjà INACTIVE avant cette migration, cf. 987-desactiver-comptes.js)");
  },
};
