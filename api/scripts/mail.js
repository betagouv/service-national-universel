const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: "../.env-prod" });
const { sendEmail } = require("../src/sendinblue");

require("../src/mongo");
const YoungModel = require("../src/models/young");

(async function fetch() {
  await run(YoungModel);
  console.log("end");
})();

let count = 0;
async function run(MyModel) {
  const cursor = MyModel.find({ cohort: 2021, status: "REFUSED" }).cursor();
  await cursor.eachAsync(async function (young) {
    count++;
    if (count % 10 === 0) console.log(count);
    try {
      let htmlContent = "";
      let subject = "";

      // const template = "refuse";

      // if (template === "validate") {
      //   htmlContent = fs.readFileSync(path.resolve(__dirname, "../src/templates/validated.html")).toString();
      //   htmlContent = htmlContent.replace(/{{cta}}/g, "https://inscription.snu.gouv.fr");
      //   htmlContent = htmlContent.replace(/{{firstName}}/g, young.firstName);
      //   htmlContent = htmlContent.replace(/{{lastName}}/g, young.lastName);
      //   subject = "Votre candidature au SNU a été validée";
      // } else if (template === "refuse") {
      //   htmlContent = fs.readFileSync(path.resolve(__dirname, "../src/templates/rejected.html")).toString();
      //   htmlContent = htmlContent.replace(/{{firstName}}/g, young.firstName);
      //   htmlContent = htmlContent.replace(/{{lastName}}/g, young.lastName);
      //   subject = "Votre candidature au SNU a été refusée";
      // }

      await sendEmail({ name: `${young.firstName} ${young.lastName}`, email: "se.legoff@gmail.com" }, subject, htmlContent);
    } catch (e) {
      console.log("e", e);
    }
  });
}

// router.post("/email/:template/:youngId", passport.authenticate("referent", { session: false }), async (req, res) => {
//   try {
//     const { youngId, template } = req.params;

//     await sendEmail({ name: `${young.firstName} ${young.lastName}`, email: young.email }, subject, htmlContent);
//     return res.status(200).send({ ok: true }); //todo
//   } catch (error) {
//     console.log(error);
//     capture(error);
//     return res.status(500).send({ ok: false, code: SERVER_ERROR });
//   }
// });
