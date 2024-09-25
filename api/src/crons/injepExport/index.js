const { generateYoungsExport, addToSlackRapport, printSlackInfo } = require("./utils");
const { capture } = require("../../sentry");
const slack = require("../../slack");
const { CohortModel } = require("../../models");

const EXPORT_YOUNGS_BEFORE_SESSION = "youngsBeforeSession";
const EXPORT_YOUNGS_AFTER_SESSION = "youngsAfterSession";

exports.handler = async () => {
  try {
    const cohorts = await CohortModel.find({});
    const exportsGenerated = {};

    for (const cohort of cohorts) {
      if (!cohort.injepExportDates) continue;
      const youngBeforeSessionExportDate = cohort.injepExportDates[EXPORT_YOUNGS_BEFORE_SESSION] ? new Date(cohort.injepExportDates[EXPORT_YOUNGS_BEFORE_SESSION]) : undefined;
      const youngAfterSessionExportDate = cohort.injepExportDates[EXPORT_YOUNGS_AFTER_SESSION] ? new Date(cohort.injepExportDates[EXPORT_YOUNGS_AFTER_SESSION]) : undefined;
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
      const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

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
    throw e;
  }
};
