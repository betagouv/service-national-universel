require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const YoungModel = require("../src/models/young");

(async function run() {
  const buffer = [];
  console.log("lets go");
  for await (const doc of YoungModel.find({}).cursor()) {
    buffer.push({
      name: `${doc.firstName} ${doc.lastName}`,
      email: doc.email,
      birthdate: doc.birthdateAt && doc.birthdateAt.toISOString(),
      status: doc.status,
    });
  }
  console.log("step done");
  let similarFound = [];
  for (const b of buffer) {
    if (b.status === "IN_PROGRESS") {
      const similarWithBetterStatus = buffer.filter(
        (a) =>
          a.name === b.name && a.birthdate === b.birthdate && ["VALIDATED", "WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED"].includes(a.status)
      );
      const alreadyFound = similarFound.find((a) => a.name === b.name && a.birthdate === b.birthdate);

      if (!alreadyFound && similarWithBetterStatus.length === 1) {
        similarFound = [...similarFound, ...similarWithBetterStatus];
        console.log(
          `Similar found for ${b.name} === ${similarWithBetterStatus[0].name} (${similarWithBetterStatus.length}) original: ${b.email} (${
            b.status
          }), new: ${similarWithBetterStatus.map((e) => `${e.email} (${e.status})`).join()}`
        );
        await YoungModel.deleteOne({ email: b.email });
      }
    }
  }
  process.exit(0);
})();
