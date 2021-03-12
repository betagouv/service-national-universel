require("dotenv").config({ path: "../.env-prod" });
require("../src/mongo");

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const YoungModel = require("../src/models/young");
const { sendEmail } = require("../src/sendinblue");

(async function run() {
  const cursor = YoungModel.find({ cohort: "2020", department: "Nouvelle-Calédonie" }).cursor();
  let count = 0;
  await cursor.eachAsync(async function (young) {
    try {
      console.log(young.email);
      if (!young.email.match(/unknown/)) {
        console.log("process");
        await send(young);
        count++;
      } else {
        console.log("skip");
      }
    } catch (e) {
      console.log(e);
    }
  });
  console.log("DONE.", count);
  process.exit(0);
})();

async function send(young) {
  try {
    const invitationToken = crypto.randomBytes(20).toString("hex");
    const invitationExpires = Date.now() + 86400000 * 7; // 7 days

    young.set({ invitationToken, invitationExpires });
    await young.save();
    await young.index();
    console.log({ newyoung: young });

    let htmlContent = fs.readFileSync("../src/templates/inviteYoung.html").toString();
    htmlContent = htmlContent.replace(/{{toName}}/g, `${young.firstName} ${young.lastName}`);
    htmlContent = htmlContent.replace(/{{fromName}}/g, `L'équipe SNU`);
    htmlContent = htmlContent.replace(/{{cta}}/g, `https://inscription.snu.gouv.fr/auth/signup?token=${invitationToken}`);
    console.log({ mail: htmlContent });

    await sendEmail({ name: `${young.firstName} ${young.lastName}`, email: young.email }, "Activez votre compte SNU", htmlContent);

    return;
  } catch (error) {
    console.log("er", error);
  }
}
