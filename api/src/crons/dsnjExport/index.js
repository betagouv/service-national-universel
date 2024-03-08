const { generateYoungsExport, generateCohesionCentersExport, addToSlackRapport, printSlackInfo } = require("./utils");
const { capture } = require("../../sentry");
const slack = require("../../slack");
const CohortModel = require("../../models/cohort");

const EXPORT_COHESION_CENTERS = "cohesionCenters";
const EXPORT_YOUNGS_BEFORE_SESSION = "youngsBeforeSession";
const EXPORT_YOUNGS_AFTER_SESSION = "youngsAfterSession";

exports.handler = async () => {
  try {
    const cohorts = await CohortModel.find({});
    const exportsGenerated = {};

    for (const cohort of cohorts) {
      if (!cohort.dsnjExportDates) return;
      const cohesionCenterExportDate = cohort.dsnjExportDates[EXPORT_COHESION_CENTERS] ? new Date(cohort.dsnjExportDates[EXPORT_COHESION_CENTERS]) : undefined;
      const youngBeforeSessionExportDate = cohort.dsnjExportDates[EXPORT_YOUNGS_BEFORE_SESSION] ? new Date(cohort.dsnjExportDates[EXPORT_YOUNGS_BEFORE_SESSION]) : undefined;
      const youngAfterSessionExportDate = cohort.dsnjExportDates[EXPORT_YOUNGS_AFTER_SESSION] ? new Date(cohort.dsnjExportDates[EXPORT_YOUNGS_AFTER_SESSION]) : undefined;
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
      const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

      if (cohesionCenterExportDate && cohesionCenterExportDate >= todayStart && cohesionCenterExportDate <= todayEnd) {
        await generateCohesionCentersExport(cohort);
        addToSlackRapport(exportsGenerated, cohort.name, EXPORT_COHESION_CENTERS);
      }
      if (youngBeforeSessionExportDate && youngBeforeSessionExportDate >= todayStart && youngBeforeSessionExportDate <= todayEnd) {
        await generateYoungsExport(cohort);
        addToSlackRapport(exportsGenerated, cohort.name, EXPORT_YOUNGS_BEFORE_SESSION);
      }
      if (youngAfterSessionExportDate && youngAfterSessionExportDate >= todayStart && youngAfterSessionExportDate <= todayEnd) {
        await generateYoungsExport(cohort, true);
        addToSlackRapport(exportsGenerated, cohort.name, EXPORT_YOUNGS_AFTER_SESSION);
      }
    }

    await slack.info({
      title: "✅ DSNJ export generation",
      text: printSlackInfo(exportsGenerated),
    });
  } catch (e) {
    slack.error({ title: "DSNJ export generation", text: e });
    capture(e);
  }
};
