require("dotenv").config({ path: "../.env-prod" });
require("../src/mongo");
const { api, deleteContact } = require("../src/sendinblue");
const YoungModel = require("../src/models/young");

(async function fetch() {
  const youngs = [];
  try {
    let page = 0;
    let loop = true;
    while (loop) {
      const a = await api(`/contacts/lists/46/contacts?limit=100&offset=${++page * 100}&sort=desc`, { method: "GET" });
      if (!a.contacts.length) loop = false;
      console.log(`YOUNGS ${youngs.length}/${a.count}`);
      youngs.push(...a.contacts);
    }
  } catch (e) {
    console.log("e", e);
  }

  for (let i = 0; i < youngs.length; i++) {
    i % 100 === 0 && console.log(i);
    const y = youngs[i];
    const a = await YoungModel.findOne({ email: y.email });
    if (a) continue;
    await deleteContact(y.id);
    console.log("DELETING FROM SENDINGBLUE ", y.email);
  }

  console.log("end");
})();

// let count = 0;
// async function run(MyModel) {
//   const cursor = MyModel.find({ phase: "INSCRIPTION" }).cursor();
//   await cursor.eachAsync(async function (doc) {
//     count++;
//     if (count % 10 === 0) console.log(count);
//     // await doc.set({ cniFiles: [] });
//     // await doc.set({ parentConsentmentFiles: [] });
//     try {
//       await doc.save();
//       await doc.index();
//     } catch (e) {
//       console.log("e", e);
//     }
//   });
// }
