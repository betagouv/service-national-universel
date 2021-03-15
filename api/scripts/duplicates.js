require("dotenv").config({ path: "../.env-prod" });

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
  buffer.forEach((b) => {
    const similar = buffer.filter((a) => a.name === b.name && a.birthdate === b.birthdate);
    const alreadyFound = similarFound.find((a) => a.name === b.name && a.birthdate === b.birthdate);
    if (!alreadyFound && similar.length > 1) {
      similarFound = [...similarFound, ...similar];
      console.log(`Similar found for ${b.name} (${similar.length}), emails: ${similar.map((e) => `${e.email} (${e.status})`).join()}`);
    }
  });
  process.exit(0);
})();
