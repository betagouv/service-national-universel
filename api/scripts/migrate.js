require("dotenv").config({ path: "./../.env-staging" });

const esclient = require("../src/es");

const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
require("../src/mongo");
var faker = require("faker/locale/fr");

const opts = { define: { freezeTableName: true, timestamps: false }, logging: false };

const connexionURL = process.env.MYSQL_URL;
const sequelize = new Sequelize(connexionURL, opts);

// const Mission = require(`../src/models/mission`);
const Structure = require(`../src/models/structure`);
// const Young = require("../src/models/young");
// const Referent = require("../src/models/referent");
// const Application = require("../src/models/application");

const migrate = async (model, migration) => {
  console.log(`>>> START ${model}`);
  try {
    console.log(`${model} deleted`);
    console.log(`MIGRATION ${model} START`);
    await migration();
  } catch (error) {
    console.log(error);
  }
};

sequelize.authenticate().then(async (e) => {
  await esclient.indices.delete({ index: "structure" });
  await Structure.deleteMany({});
  await migrate("Structure", migrateStructure);

  // await esclient.indices.delete({ index: "mission" });
  // await Mission.deleteMany({});
  // await migrate("Mission", migrateMission);

  try {
    // Migrate people in the cohesion stay
    //console.log(`### START MONGO DELETE Young`);
    //await Young.deleteMany({ phase: "COHESION_STAY" });
    //console.log(`### END DELETE young`);
    //await migrate("Young", migrateYoung);
    //console.log(`### END MONGO DELETE young`);
    //await Young.unsynchronize();
    //console.log(`### END DELETED ES Indice for young`);
    //await Young.synchronize();
    //console.log(`### END SYNC ES Indice for young`);
  } catch (e) {
    console.log(e);
  }

  // await esclient.indices.delete({ index: "referent" });
  // await Referent.deleteMany({});
  // await migrate("Referent", migrateReferent);

  // await esclient.indices.delete({ index: "application" });
  // await Application.deleteMany({});
  // await migrate("Application", migrateApplication);
});

async function migrateStructure() {
  const structuresSQL = await sequelize.query("SELECT * FROM `structures`", { type: QueryTypes.SELECT });
  let a = [];
  console.log(`${structuresSQL.length} structures detected`);
  structuresSQL.forEach(async (s) => {
    try {
      // @todo quid deleted structures ? (structure.deleted_at !== null)
      const structure = { ...s };
      structure.sqlId = s.id;
      structure.is_reseau = !!structure.is_reseau;
      if (s.longitude && s.latitude) structure.location = { lon: parseFloat(s.longitude), lat: parseFloat(s.latitude) };

      structure.statutJuridique = (() => {
        if (s.status_juridique === "Structure publique") return "PUBLIC";
        if (s.status_juridique === "Structure privée") return "PRIVATE";
        if (s.status_juridique === "Association") return "ASSOCIATION";
        return "OTHER";
      })();

      structure.associationTypes = JSON.parse(s.association_types);
      structure.structurePubliqueType = s.structure_publique_type;
      structure.structurePubliqueEtatType = s.structure_publique_etat_type;
      structure.structurePriveeType = s.structure_privee_type;

      structure.department = departmentList[s.department];
      structure.region = regionList[department2region[s.department]];

      structure.status = (() => {
        if (s.state === "En attente de validation") return "WAITING_VALIDATION";
        if (s.state === "Validée") return "VALIDATED";
        if (s.state === "Refusée") return "REFUSED";
      })();

      structure.createdAt = s.created_at;
      structure.updatedAt = s.updated_at;

      a.push(structure);
    } catch (error) {
      console.log(error);
    }
  });
  await Structure.insertMany(a);
  console.log(`${a.length} added`);
}

async function migrateMission() {
  const missionsSQL = await sequelize.query("SELECT * FROM `missions`", { type: QueryTypes.SELECT });
  let a = [];
  console.log(`${missionsSQL.length} missions detected`);
  missionsSQL.forEach(async (m) => {
    try {
      const mission = { ...m };
      mission.sqlId = m.id;
      mission.placesTotal = m.participations_max;
      mission.placesLeft = m.participations_max;
      if (m.longitude && m.latitude) {
        mission.location = {
          lon: parseFloat(m.longitude),
          lat: parseFloat(m.latitude),
        };
      }
      mission.remote = m.is_everywhere ? "true" : "false";
      mission.domains = JSON.parse(m.domaines);
      mission.format = m.format === "Perlée" ? "DISCONTINUOUS" : "CONTINUOUS";
      mission.status = (() => {
        if (m.state === "Brouillon") return "DRAFT";
        if (m.state === "En attente de validation") return "WAITING_VALIDATION";
        if (m.state === "En attente de correction") return "WAITING_CORRECTION";
        if (m.state === "Validée") return "VALIDATED";
        if (m.state === "Refusée") return "REFUSED";
        if (m.state === "Annulée") return "CANCEL";
        if (m.state === "Archivée") return "ARCHIVED";
      })();

      mission.dateEnd = m.end_date;
      mission.dateStart = m.start_date;

      a.push(mission);
    } catch (error) {
      console.log(error);
    }
  });
  await Mission.insertMany(a);
  console.log(`${a.length} added`);
}

async function migrateYoung() {
  let count = 0;
  const INTEREST_LOOKUP = {
    "Très intéressé": 5,
    Intéressé: 4,
    "Assez intéressé": 3,
    "Peu intéressé": 2,
    "Pas intéressé": 1,
  };

  const youngsSQL = await sequelize.query("SELECT * FROM `youngs`", { type: QueryTypes.SELECT });
  const arr = [];
  youngsSQL.forEach((y) => arr.push(y));

  for (let i = 0; i < arr.length; i++) {
    try {
      const y = arr[i];
      const young = {};

      // @todo password
      young.sqlId = y.id;
      young.createdAt = y.created_at;
      young.updatedAt = y.updated_at;

      young.gender = y.genre === "Fille" ? "female" : "male";
      const fn = faker.name.firstName(young.gender);
      young.firstName = fn.charAt(0).toUpperCase() + fn.slice(1);
      const ln = faker.name.lastName();
      young.lastName = ln.toUpperCase();

      if (y.birthdate) young.birthdateAt = new Date(y.birthdate);

      // @todo not anonymyse for the real migration
      young.email = `${y.id}@mail.com`;
      // young.email = (young.email || "").toLowerCase();

      young.password = "Selego1!";
      young.frenchNationality = y.nationalite_francaise === 1 ? "true" : "false";
      young.schooled = y.situation && y.situation.includes("Scolarisé") ? "true" : "false";

      young.cohort = "2020";
      young.phase = "COHESION_STAY";
      young.status = "VALIDATED";

      young.complementAddress = y.complement_adresse;
      if (y.longitude && y.latitude) {
        young.location = { lon: parseFloat(y.longitude), lat: parseFloat(y.latitude) };
      }
      young.department = departmentList[y.department];
      young.region = regionList[department2region[y.department]];

      young.defenseInterest = INTEREST_LOOKUP[y.interet_defense];
      young.defenseTypeInterest = INTEREST_LOOKUP[y.interet_defense_type];
      young.defenseDomainInterest = INTEREST_LOOKUP[y.interet_defense_domaine];
      young.defenseMotivationInterest = INTEREST_LOOKUP[y.interet_defense_motivation];
      young.securityInterest = INTEREST_LOOKUP[y.interet_securite];
      young.securityDomainInterest = INTEREST_LOOKUP[y.interet_securite_domaine];
      young.solidarityInterest = INTEREST_LOOKUP[y.interet_solidarite];
      young.healthInterest = INTEREST_LOOKUP[y.interet_sante];
      young.educationInterest = INTEREST_LOOKUP[y.interet_education];
      young.cultureInterest = INTEREST_LOOKUP[y.interet_culture];
      young.sportInterest = INTEREST_LOOKUP[y.interet_sport];
      young.environmentInterest = INTEREST_LOOKUP[y.interet_environnement];
      young.citizenshipInterest = INTEREST_LOOKUP[y.interet_citoyennete];

      // @todo check if ok
      young.parent1Status = y.status_representant;
      young.parent1FirstName = y.prenom_representant;
      young.parent1LastName = y.nom_representant;
      young.parent1Email = y.email_representant;
      young.parent1Phone = y.telephone_representant;
      young.parent1OwnAddress = y.adresse_identique_representant ? "false" : "true"; // adresse identique => !ownaddress

      young.ppsBeneficiary = y.beneficiaire_pps ? "true" : "false";
      young.paiBeneficiary = y.beneficiaire_pai ? "true" : "false";

      young.engaged = young.engaged === "Non" ? "false" : "true";

      young.engagedStructure = young.engaged_structure;
      young.missionFormat = young.mission_format === "Continue" ? "CONTINUOUS" : "DISCONTINUOUS";
      if (count++ % 10 === 0) console.log(`${count} young added`);
      await Young.create(young);
    } catch (error) {
      console.log(error);
    }
  }
}

async function migrateReferent() {
  const profilesSql = await sequelize.query("SELECT * FROM `profiles`", { type: QueryTypes.SELECT });
  let a = [];
  console.log(`${profilesSql.length} profiles detected`);
  profilesSql.forEach(async (u) => {
    try {
      if (!u.referent_department && !u.referent_region) return;
      const referent = { ...u };
      // referent.firstName = u.first_name;
      // referent.lastName = u.last_name;

      // referent.email = (referent.email || "").toLowerCase();

      //start anonymisation
      const fn = faker.name.firstName();
      referent.firstName = fn.charAt(0).toUpperCase() + fn.slice(1);
      const ln = faker.name.lastName();
      referent.lastName = ln.toUpperCase();
      referent.email = `${referent.firstName}.${referent.lastName}@mail.com`;
      //end anonymisation

      referent.role = "responsable"; // @todo update role
      // @todo which depart or region ?
      a.push(referent);
    } catch (error) {
      console.log(error);
    }
  });
  await Referent.insertMany(a);
  console.log(`${a.length} added`);
}

async function migrateApplication() {
  const missionYoungSQL = await sequelize.query("SELECT * FROM `mission_young`", { type: QueryTypes.SELECT });
  let a = [];
  console.log(`${missionYoungSQL.length} mission_youngs detected`);

  // good old for(;;) because of the inner promises in the loop.
  for (let i = 0; i < missionYoungSQL.length; i++) {
    const my = missionYoungSQL[i];
    try {
      const app = { ...my };

      const mission = await Mission.findOne({ sqlId: my.mission_id });
      app.missionId = (mission && mission._id) || "N/A";
      app.missionName = mission.name;
      app.missionDepartment = mission.department;
      app.missionRegion = mission.region;

      const young = await Young.findOne({ sqlId: my.young_id });
      app.youngId = (young && young._id) || "N/A";
      app.youngFirstName = young.firstName;
      app.youngLastName = young.lastName;
      app.youngEmail = young.email;

      app.status = (() => {
        if (my.status === "CANDIDATURE_CREEE") return "WAITING_VALIDATION";
        if (my.status === "CANDIDATURE_VALIDEE") return "VALIDATED";
        if (my.status === "CANDIDATURE_REFUSEE") return "REFUSED";
        if (my.status === "CANDIDATURE_ANNULEE") return "CANCEL";
        if (my.status === "CANDIDATURE_PRESELECTIONNEE") return;
        if (my.status === "CANDIDATURE_CONTRAT_SIGNE") return;
        if (my.status === "MISSION_EN_COURS") return;
        if (my.status === "MISSION_EFFECTUEE") return "ARCHIVED";
        if (my.status === "MISSION_NON_ACHEVEE") return;
      })();

      app.createdAt = my.created_at;
      app.updatedAt = my.updated_at;
      a.push(app);
    } catch (error) {
      console.log(error);
    }
  }
  await Application.insertMany(a);
  console.log(`${a.length} added`);
}

const departmentList = {
  "01": "Ain",
  "02": "Aisne",
  "03": "Allier",
  "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes",
  "06": "Alpes-Maritimes",
  "07": "Ardèche",
  "08": "Ardennes",
  "09": "Ariège",
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

const regionList = {
  84: "Auvergne-Rhône-Alpes",
  27: "Bourgogne-Franche-Comté",
  53: "Bretagne",
  24: "Centre-Val de Loire",
  94: "Corse",
  44: "Grand Est",
  32: "Hauts-de-France",
  11: "Île-de-France",
  28: "Normandie",
  75: "Nouvelle-Aquitaine",
  76: "Occitanie",
  52: "Pays de la Loire",
  93: "Provence-Alpes-Côte d'Azur",
  971: "Guadeloupe",
  972: "Martinique",
  973: "Guyane",
  974: "La Réunion",
  975: "Saint-Pierre-et-Miquelon",
  976: "Mayotte",
  977: "Saint-Barthélemy",
  978: "Saint-Martin",
  984: "Terres australes et antarctiques françaises",
  986: "Wallis-et-Futuna",
  987: "Polynésie française",
  988: "Nouvelle-Calédonie",
};

const department2region = {
  "01": "84",
  "02": "32",
  "03": "84",
  "04": "93",
  "05": "93",
  "06": "93",
  "07": "84",
  "08": "44",
  "09": "76",
  10: "44",
  11: "76",
  12: "76",
  13: "93",
  14: "28",
  15: "84",
  16: "75",
  17: "75",
  18: "24",
  19: "75",
  21: "27",
  22: "53",
  23: "75",
  24: "75",
  25: "27",
  26: "84",
  27: "28",
  28: "24",
  29: "53",
  "2A": "94",
  "2B": "94",
  30: "76",
  31: "76",
  32: "76",
  33: "75",
  34: "76",
  35: "53",
  36: "24",
  37: "24",
  38: "84",
  39: "27",
  40: "75",
  41: "24",
  42: "84",
  43: "84",
  44: "52",
  45: "24",
  46: "76",
  47: "75",
  48: "76",
  49: "52",
  50: "28",
  51: "44",
  52: "44",
  53: "52",
  54: "44",
  55: "44",
  56: "53",
  57: "44",
  58: "27",
  59: "32",
  60: "32",
  61: "28",
  62: "32",
  63: "84",
  64: "75",
  65: "76",
  66: "76",
  67: "44",
  68: "44",
  69: "84",
  70: "27",
  71: "27",
  72: "52",
  73: "84",
  74: "84",
  75: "11",
  76: "28",
  77: "11",
  78: "11",
  79: "75",
  80: "32",
  81: "76",
  82: "76",
  83: "93",
  84: "93",
  85: "52",
  86: "75",
  87: "75",
  88: "44",
  89: "27",
  90: "27",
  91: "11",
  92: "11",
  93: "11",
  94: "11",
  95: "11",
  971: "971",
  972: "972",
  973: "973",
  974: "974",
  975: "975",
  976: "976",
  977: "977",
  978: "978",
  984: "984",
  986: "986",
  987: "987",
  988: "988",
};
