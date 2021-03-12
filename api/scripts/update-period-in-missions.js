require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const MissionModel = require("../src/models/mission");
(async function run() {
  const cursor = MissionModel.find({ period: { $ne: [] } }).cursor();
  let count = 0;
  await cursor.eachAsync(async function (doc) {
    try {
      let period = [];
      let subPeriod = [];
      if (doc.period.includes("Pendant les vacances scolaires")) {
        period.push("DURING_HOLIDAYS");
        subPeriod.push(...Object.keys(MISSION_PERIOD_DURING_HOLIDAYS));
      }
      if (doc.period.includes("En-dehors des vacances scolaires (mercredi après-midi, soirées et/ou weekends)")) {
        period.push("DURING_SCHOOL");
        subPeriod.push(...Object.keys(MISSION_PERIOD_DURING_SCHOOL));
      }

      if (period.length) {
        // console.log("before", doc.period);
        // console.log("---");
        // console.log("period   ", period);
        // console.log("subPeriod", subPeriod);
      } else {
        let duringSchool = [];
        let duringHolidays = [];

        doc.period.forEach((p) => {
          if (MISSION_PERIOD_DURING_HOLIDAYS[p]) {
            duringHolidays.push(p);
          } else if (MISSION_PERIOD_DURING_SCHOOL[p]) {
            duringSchool.push(p);
          }
        });

        if (duringSchool.length) {
          period.push("DURING_SCHOOL");
          subPeriod.push(...duringSchool);
        }
        if (duringHolidays.length) {
          period.push("DURING_HOLIDAYS");
          subPeriod.push(...duringHolidays);
        }
        // console.log("before", doc.period);
        // console.log("---");
        // console.log("period   ", period);
        // console.log("subPeriod", subPeriod);
      }
      doc.set({ period, subPeriod });
      count++;
      console.log(count);
      await doc.save();
      await doc.index();
    } catch (e) {
      console.log(e);
    }
  });
  console.log("DONE.", count);
  process.exit(0);
})();

const MISSION_PERIOD_DURING_HOLIDAYS = {
  SUMMER: "SUMMER",
  AUTUMN: "AUTUMN",
  DECEMBER: "DECEMBER",
  WINTER: "WINTER",
  SPRING: "SPRING",
};

const MISSION_PERIOD_DURING_SCHOOL = {
  EVENING: "EVENING",
  END_DAY: "END_DAY",
  WEEKEND: "WEEKEND",
};
