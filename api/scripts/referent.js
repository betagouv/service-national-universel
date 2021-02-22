const crypto = require("crypto");
const fs = require("fs");
const csv = require("csv-parser");

require("dotenv").config({ path: "./../.env-prod" });
require("../src/mongo");

const { sendEmail } = require("../src/sendinblue");
const ReferentModel = require("../src/models/referent");

(async () => {
  const arr = await parse("./Liste_référent_régional.csv");
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    console.log({ body: arr[i] });
    await send({ body: arr[i] });
    // try {
    //   const school = await SchoolModel.findOneAndUpdate({ postcode: arr[i].postcode, name2: arr[i].name2 }, arr[i], { upsert: true, new: true });
    //   await school.index();
    // } catch (e) {
    //   console.log("e", e);
    // }
    console.log(count++);
  }

  console.log("aa", arr.length);
  process.exit(1);
})();

function parse(file) {
  let arr = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on("data", async (row) => {
        let newRow = {};
        try {
          const obj = {};

          Object.keys(row).map((key) => {
            newRow[key.trim()] = row[key]; // fix weird bug with the key REGION
          });

          const fn = newRow["PRENOM"].trim();
          obj.firstName = fn.charAt(0).toUpperCase() + fn.slice(1);
          obj.lastName = newRow["NOM"].trim().toUpperCase();
          obj.email = newRow["MAIL"].trim().toLowerCase();
          obj.region = newRow["REGION"];
          obj.role = "referent_region";

          arr.push(obj);
        } catch (e) {
          console.log("e", e);
        }
      })
      .on("end", async () => {
        resolve(arr);
      });
  });
}

async function send(req) {
  try {
    const obj = {};
    if (req.body.hasOwnProperty(`email`)) obj.email = req.body.email;
    if (req.body.hasOwnProperty(`firstName`)) obj.firstName = req.body.firstName;
    if (req.body.hasOwnProperty(`lastName`)) obj.lastName = req.body.lastName;
    if (req.body.hasOwnProperty(`role`)) obj.role = req.body.role;
    if (req.body.hasOwnProperty(`region`)) obj.region = req.body.region;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = Date.now() + 86400000 * 7; // 7 days

    const referent = await ReferentModel.create(obj);

    let htmlContent = fs.readFileSync("../src/templates/inviteReferentRegion.html").toString();
    htmlContent = htmlContent.replace(/{{toName}}/g, `${obj.firstName} ${obj.lastName}`);
    htmlContent = htmlContent.replace(/{{fromName}}/g, `Gabrielle Bouxin`);
    htmlContent = htmlContent.replace(/{{region}}/g, `${obj.region}`);
    htmlContent = htmlContent.replace(/{{cta}}/g, `https://admin.snu.gouv.fr/auth/signup?token=${invitation_token}`);

    await sendEmail({ name: `${obj.firstName} ${obj.lastName}`, email: obj.email }, "Activez votre compte référent régional SNU", htmlContent);

    return;
  } catch (error) {
    console.log("er", error);
  }
}

/*

  numero_UAI: '0623209B',
  'dénomination_principale': 'CENTRE EDUCATIF FERME',
  'Dénomination_complémentaire': 'BRUAY LA BUISSIERE',
  code_postal_UAI: '62700',
  'localité_acheminement': 'BRUAY LA BUISSIERE',
  departement: '062',
  nature_uai: '271',
  libelle_court: 'C.A.E.',
  'nature libellé': 'CENTRE D ACTION EDUCATIVE',
  'Ministère tutelle ': 'JUSTICE',
  UAIDTO: '1-Oct-72',
  ACADCO: '09'
  */

const departmentList = {
  1: "Ain",
  2: "Aisne",
  3: "Allier",
  4: "Alpes-de-Haute-Provence",
  5: "Hautes-Alpes",
  6: "Alpes-Maritimes",
  7: "Ardèche",
  8: "Ardennes",
  9: "Ariège",
  10: "Aube",
  11: "Aude",
  12: "Aveyron",
  13: "Bouches-du-Rhône",
  14: "Calvados",
  15: "Cantal",
  16: "Charente",
  17: "Charente-Maritime",
  18: "Cher",
  19: "Corrèze",
  20: "Corse",
  21: "Côte-d'Or",
  22: "Côtes-d'Armor",
  23: "Creuse",
  24: "Dordogne",
  25: "Doubs",
  26: "Drôme",
  27: "Eure",
  28: "Eure-et-Loire",
  29: "Finistère",
  "2A": "Corse-du-Sud",
  "2B": "Haute-Corse",
  30: "Gard",
  31: "Haute-Garonne",
  32: "Gers",
  33: "Gironde",
  34: "Hérault",
  35: "Ille-et-Vilaine",
  36: "Indre",
  37: "Indre-et-Loire",
  38: "Isère",
  39: "Jura",
  40: "Landes",
  41: "Loir-et-Cher",
  42: "Loire",
  43: "Haute-Loire",
  44: "Loire-Atlantique",
  45: "Loiret",
  46: "Lot",
  47: "Lot-et-Garonne",
  48: "Lozère",
  49: "Maine-et-Loire",
  50: "Manche",
  51: "Marne",
  52: "Haute-Marne",
  53: "Mayenne",
  54: "Meurthe-et-Moselle",
  55: "Meuse",
  56: "Morbihan",
  57: "Moselle",
  58: "Nièvre",
  59: "Nord",
  60: "Oise",
  61: "Orne",
  62: "Pas-de-Calais",
  63: "Puy-de-Dôme",
  64: "Pyrénées-Atlantiques",
  65: "Hautes-Pyrénées",
  66: "Pyrénées-Orientales",
  67: "Bas-Rhin",
  68: "Haut-Rhin",
  69: "Rhône",
  70: "Haute-Saône",
  71: "Saône-et-Loire",
  72: "Sarthe",
  73: "Savoie",
  74: "Haute-Savoie",
  75: "Paris",
  76: "Seine-Maritime",
  77: "Seine-et-Marne",
  78: "Yvelines",
  79: "Deux-Sèvres",
  80: "Somme",
  81: "Tarn",
  82: "Tarn-et-Garonne",
  83: "Var",
  84: "Vaucluse",
  85: "Vendée",
  86: "Vienne",
  87: "Haute-Vienne",
  88: "Vosges",
  89: "Yonne",
  90: "Territoire de Belfort",
  91: "Essonne",
  92: "Hauts-de-Seine",
  93: "Seine-Saint-Denis",
  94: "Val-de-Marne",
  95: "Val-d'Oise",
  971: "Guadeloupe",
  972: "Martinique",
  973: "Guyane",
  974: "La Réunion",
  975: "Saint-Pierre-et-Miquelon",
  976: "Mayotte",
  987: "Polynésie française",
  988: "Nouvelle-Calédonie",
};
