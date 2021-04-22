require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const YoungModel = require("../src/models/young");

const clean = async (model) => {
  const cursor = model.find({ address: { $ne: null } }).cursor();
  let countTotal = 0;
  let count = 0;
  await cursor.eachAsync(async function (doc) {
    countTotal++;
    if (countTotal % 100 === 0) console.log(countTotal);
    try {
      const r = doc.address.match(/(.*)\d{5}/);
      if (!r || !r[1]) return;
      count++;
      // console.log(`${doc.address}`);
      // console.log(`${r[1]}`);
      // console.log(doc.zip);
      // console.log(doc.city);
      // console.log(`---`);
      doc.set({ address: r[1] });
      await doc.save();
      await doc.index();
    } catch (e) {
      console.log("e", e);
    }
  });
  console.log(`${countTotal} youngs scanned. ${count} has been modified.`);
};

(async function run() {
  console.log("START");
  await clean(YoungModel);
  process.exit(0);
})();
