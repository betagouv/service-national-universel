require("../mongo");

const contactModel = require("../models/contact");

(async function syncContact() {
  try {
    let youngs = require("./youngs.json");
    let newContact = 0;
    let updatedContact = 0;

    for (let young of youngs.slice(50200, youngs.length)) {
      let attributes = [];
      if (young.createdAt) {
        attributes.push({
          name: "date de création",
          format: "date",
          value: young.createdAt.$date.toString(),
        });
      }

      if (young.lastLoginAt) {
        attributes.push({
          name: "dernière connexion",
          format: "date",
          value: young.lastLoginAt.$date.toString(),
        });
      }
      attributes.push({ name: "lien vers profil", format: "link", value: `https://admin.snu.gouv.fr/volontaire/${young._id.$oid}` });
      if (young.department) {
        attributes.push({ name: "département", format: "string", value: young.department });
      }
      if (young.region) {
        attributes.push({ name: "région", format: "string", value: young.region });
      }
      attributes.push({ name: "role", format: "string", value: "young" });
      if (young.cohort) {
        attributes.push({ name: "cohorte", format: "string", value: young.cohort });
      }
      if (young.status) {
        attributes.push({ name: "statut général", format: "string", value: young.status });
      }
      if (young.statusPhase1) {
        attributes.push({ name: "statut phase 1", format: "string", value: young.statusPhase1 });
      }
      if (young.statusPhase2) {
        attributes.push({ name: "statut phase 2", format: "string", value: young.statusPhase2 });
      }
      if (young.statusPhase3) {
        attributes.push({ name: "statut phase 3", format: "string", value: young.statusPhase3 });
      }
      attributes.push({ name: "lien vers candidatures", format: "link", value: `https://admin.snu.gouv.fr/volontaire/${young._id.$oid}/phase2` });
      attributes.push({
        name: "lien vers équipe départementale",
        format: "link",
        value: `https://admin.snu.gouv.fr/user?department=${young.department}&role=referent_department`,
      });
      let contact = await contactModel.findOne({ email: young.email });

      if (!contact) {
        newContact++;
        contact = await contactModel.create({
          firstName: young.firstName,
          lastName: young.lastName,
          email: young.email,
          attributes,
        });
      } else {
        updatedContact++;
        contact.attributes = attributes;
        contact.firstName = young.firstName;
        contact.lastName = young.lastName;
        await contact.save();
      }
      console.log(youngs.indexOf(young));
    }
    console.log("new contact : ", newContact);
    console.log("updated contact : ", updatedContact);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
})();

// (async function restore() {
//     try {
//         let newContact = 0;
//         let updatedContact = 0;

//         await contactModel.deleteMany({});

//         for (let young of youngs) {
//             console.log(young);
//             contact = await contactModel.create({
//                 firstName: young.firstName,
//                 lastName: young.lastName,
//                 email: young.email,
//                 //attributes: young.attributes,
//             });
//         }
//         console.log("new contact : ", newContact);
//         console.log("updated contact : ", updatedContact);
//         process.exit(0);

//     } catch (error) {
//         console.log(error);
//         process.exit(0);

//     }
// });
