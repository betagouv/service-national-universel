const mongoose = require("mongoose");
const { APPLICATION_STATUS } = require("snu-lib");
const { logger } = require("../src/logger");
const { ApplicationModel } = require("../src/models");

/**
 * Rattrapage du marqueur `proposalNotAccepted` (lot GOO-146) sur les candidatures déjà sorties de
 * WAITING_ACCEPTATION.
 *
 * Le hook du modèle `application` ne tient le marqueur qu'à la sauvegarde d'un changement de statut :
 * une proposition refusée ou annulée avant le déploiement n'en porte pas, et resterait traitée comme une
 * candidature ordinaire (périmètre de la structure, transitions de statut).
 *
 * Une candidature REFUSED ou CANCEL est marquée quand son historique de statuts (`application_patches`) :
 *  - commence par WAITING_ACCEPTATION : elle est née d'une proposition ;
 *  - ne passe par aucun statut d'engagement (acceptation du volontaire, validation, mission en cours ou
 *    réalisée) : la proposition n'a jamais été acceptée ;
 *  - aboutit au statut courant : l'historique ne laisse pas de changement non tracé.
 * Sans historique exploitable, la candidature est laissée en l'état. Les statuts ne sont jamais modifiés.
 *
 * L'écriture passe par le pilote (pas par le modèle) : aucun patch d'historique ni hook, un seul champ.
 * La date de mise à jour avance, ce qui répercute la ligne dans l'index Elasticsearch `application` par le
 * flux de modifications. Rejouable : seules les lignes non marquées sont examinées.
 */
const { WAITING_ACCEPTATION, WAITING_VALIDATION, WAITING_VERIFICATION, VALIDATED, IN_PROGRESS, DONE, REFUSED, CANCEL } = APPLICATION_STATUS;

const ENGAGED_STATUSES = [WAITING_VALIDATION, WAITING_VERIFICATION, VALIDATED, IN_PROGRESS, DONE];
const EXIT_STATUSES = [REFUSED, CANCEL];
const BATCH_SIZE = 500;

/**
 * Suite des statuts d'une candidature, lue dans ses patches (déjà triés par date). Une valeur d'origine
 * qui ne prolonge pas la suite révèle un changement non tracé : elle y est ajoutée, pour ne jamais
 * ignorer un passage par un statut d'engagement.
 */
function statusSequence(patches) {
  const sequence = [];
  for (const patch of patches) {
    const op = patch.ops && patch.ops[0];
    if (!op || op.op === "remove") continue;
    if (typeof op.originalValue === "string" && sequence[sequence.length - 1] !== op.originalValue) sequence.push(op.originalValue);
    if (typeof op.value === "string") sequence.push(op.value);
  }
  return sequence;
}

function isUnacceptedProposal(sequence, currentStatus) {
  return sequence[0] === WAITING_ACCEPTATION && sequence[sequence.length - 1] === currentStatus && sequence.every((status) => !ENGAGED_STATUSES.includes(status));
}

async function rattraper({ batchSize = BATCH_SIZE } = {}) {
  const applications = mongoose.connection.db.collection(ApplicationModel.collection.name);
  const patches = mongoose.connection.db.collection("application_patches");

  let derniere = null;
  let examinees = 0;
  let marquees = 0;
  for (;;) {
    // Pagination par _id : les lignes marquées en cours de route sortent du filtre sans décaler la suite.
    const filter = { status: { $in: EXIT_STATUSES }, proposalNotAccepted: { $ne: true }, ...(derniere ? { _id: { $gt: derniere } } : {}) };
    const lot = await applications
      .find(filter, { projection: { status: 1 } })
      .sort({ _id: 1 })
      .limit(batchSize)
      .toArray();
    if (!lot.length) break;
    derniere = lot[lot.length - 1]._id;
    examinees += lot.length;

    // Un patch par changement de statut : `$elemMatch` ne renvoie que l'opération sur le statut, pas le reste du document.
    const statusPatches = await patches
      .find({ ref: { $in: lot.map((application) => application._id) }, "ops.path": "/status" }, { projection: { ref: 1, date: 1, ops: { $elemMatch: { path: "/status" } } } })
      .toArray();
    const parCandidature = new Map();
    for (const patch of statusPatches) {
      const key = String(patch.ref);
      parCandidature.set(key, [...(parCandidature.get(key) || []), patch]);
    }

    const aMarquer = lot
      .filter((application) => {
        const historique = (parCandidature.get(String(application._id)) || []).sort((a, b) => new Date(a.date) - new Date(b.date) || String(a._id).localeCompare(String(b._id)));
        return isUnacceptedProposal(statusSequence(historique), application.status);
      })
      .map((application) => application._id);
    if (!aMarquer.length) continue;

    const { modifiedCount } = await applications.updateMany(
      { _id: { $in: aMarquer }, proposalNotAccepted: { $ne: true } },
      { $set: { proposalNotAccepted: true, updatedAt: new Date() } },
    );
    marquees += modifiedCount;
  }
  logger.info(`GOO-146 - candidatures REFUSED/CANCEL : ${examinees} examinées, ${marquees} marquées proposition non acceptée`);
  return { examinees, marquees };
}

module.exports = {
  async up() {
    await rattraper();
  },

  rattraper,

  async down() {
    // Le marqueur reflète l'historique des statuts : le retirer rouvrirait ces candidatures à la structure.
    logger.info("GOO-146 - rattrapage du marqueur proposalNotAccepted : pas de rollback");
  },
};
