const { COHORT_STATUS } = require("snu-lib");
const { logger } = require("../src/logger");
const { CohortModel, CohortGroupModel } = require("../src/models");

// Cohortes 2024 archivées seulement partiellement (exceptions à l'archivage total).
const PARTIAL_EXCEPTIONS = ["Toussaint 2024", "Toussaint 2024 - La Réunion", "2024 CLE 05", "2024 CLE 06 - Novembre"];

// Résout les ids des groupes de cohortes d'une année donnée.
// cohortGroupId est stocké en String côté cohorte -> on convertit les ObjectId.
async function getCohortGroupIds(year) {
  const groups = await CohortGroupModel.find({ year }).select("_id");
  return groups.map((group) => group._id.toString());
}

async function setCohortsStatus(cohorts, status, fromUser) {
  for (const cohort of cohorts) {
    cohort.set({ status });
    await cohort.save({ fromUser });
  }
}

module.exports = {
  async up() {
    const fromUser = { firstName: "Archivage cohortes 2024/2025" };

    const ids2024 = await getCohortGroupIds(2024);
    const ids2025 = await getCohortGroupIds(2025);

    // Garde de sûreté : on n'écrit rien si les groupes ne sont pas peuplés.
    if (ids2024.length === 0 || ids2025.length === 0) {
      throw new Error(`Groupes de cohortes introuvables (2024: ${ids2024.length}, 2025: ${ids2025.length}). Migration interrompue.`);
    }

    // Archivage TOTAL : cohortes 2024, sauf les exceptions Toussaint.
    const cohortsToFullyArchive = await CohortModel.find({
      cohortGroupId: { $in: ids2024 },
      name: { $nin: PARTIAL_EXCEPTIONS },
    });
    await setCohortsStatus(cohortsToFullyArchive, COHORT_STATUS.FULLY_ARCHIVED, fromUser);

    // Archivage PARTIEL : cohortes 2025 + exceptions Toussaint 2024.
    const cohortsToArchive = await CohortModel.find({
      $or: [{ cohortGroupId: { $in: ids2025 } }, { name: { $in: PARTIAL_EXCEPTIONS } }],
    });
    await setCohortsStatus(cohortsToArchive, COHORT_STATUS.ARCHIVED, fromUser);

    logger.info(`Archivage cohortes 2024/2025 - total (FULLY_ARCHIVED): ${cohortsToFullyArchive.length}, partiel (ARCHIVED): ${cohortsToArchive.length}`);
  },

  async down() {
    const fromUser = { firstName: "Rollback archivage cohortes 2024/2025" };

    const ids2024 = await getCohortGroupIds(2024);
    const ids2025 = await getCohortGroupIds(2025);

    // Repose à PUBLISHED les cohortes 2024/2025 concernées (elles l'étaient avant la migration).
    const cohorts = await CohortModel.find({
      $or: [{ cohortGroupId: { $in: [...ids2024, ...ids2025] } }, { name: { $in: PARTIAL_EXCEPTIONS } }],
    });
    await setCohortsStatus(cohorts, COHORT_STATUS.PUBLISHED, fromUser);

    logger.info(`Rollback archivage cohortes 2024/2025 - ${cohorts.length} cohortes remises à PUBLISHED`);
  },
};
