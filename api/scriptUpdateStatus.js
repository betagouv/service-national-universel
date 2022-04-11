require("dotenv").config({ path: "./.env-staging" });
require("./src/mongo");
const YoungModel = require("./src/models/young");
const ApplicationModel = require("./src/models/application");
const { YOUNG_STATUS_PHASE2 } = require("snu-lib/constants");

(async () => {
  const cursor = YoungModel.find().cursor();
  let countTotal = 0;
  let needToBeUpdated = 0;
  await cursor.eachAsync(async function (young) {
    countTotal++;
    if (countTotal % 200 === 0) console.log(countTotal);
    try {
      const applications = await ApplicationModel.find({ youngId: young._id });
      young.set({ phase2ApplicationStatus: applications.map((e) => e.status) });

      const activeApplication = applications.filter(
        (a) => a.status === "WAITING_VALIDATION" || a.status === "VALIDATED" || a.status === "IN_PROGRESS" || a.status === "WAITING_VERIFICATION",
      );

      // we keep in the doc the date, if we have to display it in the certificate later
      young.set({ statusPhase2UpdatedAt: Date.now() });

      if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED || young.statusPhase2 === YOUNG_STATUS_PHASE2.WITHDRAWN) {
        // We do not change young status if phase 2 is already VALIDATED (2020 cohort or manual change) or WITHDRAWN.
        young.set({ statusPhase2: young.statusPhase2 });
      } else if (Number(young.phase2NumberHoursDone) >= 84) {
        // We change young status to DONE if he has 84 hours of phase 2 done.
        young.set({ statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED });
      } else if (activeApplication.length) {
        // We change young status to IN_PROGRESS if he has an 'active' application.
        needToBeUpdated++;
        young.set({ statusPhase2: YOUNG_STATUS_PHASE2.IN_PROGRESS });
      } else {
        // We change young status to WAITING_LIST if he has no estimated hours of phase 2.
        needToBeUpdated++;
        young.set({ statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION });
      }
    } catch (e) {
      console.log("CATCH", e);
    }
  });
  console.log(`${countTotal} youngs scanned`);
  console.log(`${needToBeUpdated} youngs need to be updated to active status`);

  process.exit(0);
})();
