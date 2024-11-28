// To test run:
// ts-node ./src/crons/__tester__.ts patch/young
import { initDB } from "../mongo";

// You need to run in local apps and target the right database (Prod usually)

(async () => {
  await initDB();

  switch (process.argv[2]) {
    case "patch/young":
      await require("./patch/young").manualHandler("2023-11-08", "2023-11-09");
      break;
    case "refresh-materialized-views":
      await require("./patch/refresh-materialized-views").handler();
      break;
    case "syncContactSupport":
      await require("./syncContactSupport").handler();
      break;
    case "patch/structure":
      await require("./patch/structure").manualHandler("2023-11-08", "2023-11-09");
      break;
    case "reminder/inscription":
      await require("./reminderInscription").handler();
      break;
    case "parent-revalidate-ri":
      await require("./parentRevalidateRI").handler();
      break;
    case "dsnj":
      await require("./dsnjExport/index").handler();
      break;
    case "classe-status":
      await require("./classesStatusUpdate").handler();
      break;
    case "goal":
      await require("./computeGoalsInscription").handler();
      break;
    case "check-coherence":
      await require("./checkCoherence").handler();
      break;
    case "autoValidatePhase1":
      await require("./autoValidatePhase1").handler();
      break;
    default:
      console.log("No cron found for " + process.argv[2]);
  }
  process.exit(0);
})();
