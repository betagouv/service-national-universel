const fs = require("fs");
const path = require("path");
const fileName = path.basename(__filename, ".js");
const dir = path.dirname(__filename);
require("dotenv").config({ path: `${dir}/../../.env-prod` });

require("../mongo");
// ! Mettre en dur l'URI de la base de données SNU dans le require ci-dessous pour bien se co a la prod
require("../../../../service-national-universel/api/src/mongo");

const { writeAsyncToCSV } = require("./utils");

const ContactModel = require("../models/contact");
const ReferentModel = require("../../../../service-national-universel/api/src/models/referent");
const YoungModel = require("../../../../service-national-universel/api/src/models/young");

(async () => {
  try {
    let loop_counter = 0;
    let found = 0;

    const stream = fs.createWriteStream(`${dir}/${new Date().toISOString()}_${fileName}.csv`);

    await ContactModel.find({ role: { $in: [null, "admin exterior", "young exterior"] } })
      .cursor()
      .addCursorFlag("noCursorTimeout", true)
      .eachAsync(async (contact) => {
        loop_counter++;
        if (loop_counter % 100 === 0) console.log(`loop_counter ${loop_counter}`);
        const contactEmail = contact.email;
        const emailRegex = new RegExp("^" + contactEmail + "$", "i");

        const referent = await ReferentModel.findOne({ email: emailRegex });

        if (referent) {
          found++;
          console.log("referent", referent.email);
          const new_line = [
            {
              _id: contact._id.toString(),
              email: contactEmail,
              foundEmail: referent.email,
              oldRole: contact.role,
              newRole: "referent",
            },
          ];
          writeAsyncToCSV(new_line, stream);
          // await contact.save();
          return;
        }

        const young = await YoungModel.findOne({ email: emailRegex });

        if (young) {
          found++;
          console.log("young", young.email);
          const new_line = [
            {
              _id: contact._id.toString(),
              email: contactEmail,
              foundEmail: young.email,
              oldRole: contact.role,
              newRole: "young",
            },
          ];
          writeAsyncToCSV(new_line, stream);
          // await contact.save();
          return;
        }

        const parent1 = await YoungModel.findOne({ parent1Email: emailRegex });

        if (parent1) {
          found++;
          console.log("parent", parent1.parent1Email);
          const new_line = [
            {
              _id: contact._id.toString(),
              email: contactEmail,
              foundEmail: parent1.parent1Email,
              oldRole: contact.role,
              newRole: "parent",
            },
          ];
          writeAsyncToCSV(new_line, stream);
          // await contact.save();
          return;
        }

        const parent2 = await YoungModel.findOne({ parent2Email: emailRegex });

        if (parent2) {
          found++;
          console.log("parent", parent2.parent2Email);
          const new_line = [
            {
              _id: contact._id.toString(),
              email: contactEmail,
              foundEmail: parent2.parent2Email,
              oldRole: contact.role,
              newRole: "parent",
            },
          ];
          writeAsyncToCSV(new_line, stream);
          // await contact.save();
          return;
        }
      });

    console.log(`found ${found} of ${loop_counter} contacts`);

    console.log("DONE");
    process.exit(0);
  } catch (e) {
    console.log("e", e);
  }
})();
