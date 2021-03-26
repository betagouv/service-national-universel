require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const ReferentModel = require("../src/models/referent");

const sync = async (model) => {
  const cursor = model.find({}).cursor();
  let count = 0;
  let countTot = 0;
  await cursor.eachAsync(async function (doc) {
    countTot++;
    try {
      if (!/(selego\.co)|(beta\.gouv\.fr)/.test(doc.email)) {
        let email = doc.email.replace("@", "").concat("@mail.com");
        // console.log(email);
        count++;
        doc.set({ email });
        console.log(doc);
        await doc.save();
        await doc.index();
      }
    } catch (e) {
      console.log("e", e);
    }
    if (count % 100 === 0) console.log(countTot);
  });
  console.log(count, countTot);
};

(async function run() {
  await sync(ReferentModel);
  process.exit(0);
})();
