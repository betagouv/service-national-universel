require("dotenv").config({ path: "./../.env-staging" });
const esclient = require("../src/es");

const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
require("../src/mongo");
var faker = require("faker/locale/fr");

const opts = { define: { freezeTableName: true, timestamps: false }, logging: false };

const connexionURL = process.env.MYSQL_URL;
const sequelize = new Sequelize(connexionURL, opts);

const Mission = require(`../src/models/mission`);
const Structure = require(`../src/models/structure`);
const Young = require("../src/models/young");
const Referent = require("../src/models/referent");
const Application = require("../src/models/application");

const logPrecentage = (value, total) => {
  console.log(`${parseInt((value * 100) / total)} %`);
};

const migrate = async (model, migration) => {
  console.log(`>>> START ${model}`);
  try {
    console.log(`MIGRATION ${model} START`);
    await migration();
  } catch (error) {
    console.log(error);
  }
};

sequelize.authenticate().then(async (e) => {
  // try {
  //   await esclient.indices.delete({ index: "structure" });
  // } catch (error) {
  //   console.log("ERROR ES", error);
  // }
  // await Structure.deleteMany({});
  // await migrate("Structure", migrateStructure);
  // await migrate("Network", migrateNetwork);

  // // await esclient.indices.delete({ index: "referent" });
  // await Referent.deleteMany({ sqlId: { $ne: null } });
  // await migrate("Referent", migrateReferent);
  // await migrate("Referent / Members", migrateStructureMembers);

  // try {
  //   await esclient.indices.delete({ index: "mission" });
  // } catch (error) {
  //   console.log("ERROR ES", error);
  // }
  // await Mission.deleteMany({});
  // await migrate("Mission", migrateMission);

  // try {
  //   // Migrate people in the cohesion stay
  //   console.log(`### START MONGO DELETE Young`);
  //   await Young.deleteMany({ phase: "COHESION_STAY" });
  //   console.log(`### END DELETE young`);
  //   await migrate("Young", migrateYoung);
  //   console.log(`### END MONGO DELETE young`);
  //   await Young.unsynchronize();
  //   console.log(`### END DELETED ES Indice for young`);
  //   await Young.synchronize();
  //   console.log(`### END SYNC ES Indice for young`);
  // } catch (e) {
  //   console.log(e);
  // }

  try {
    await esclient.indices.delete({ index: "application" });
  } catch (error) {
    console.log("ERROR ES", error);
  }
  await Application.deleteMany({});
  await migrate("Application", migrateApplication);
  process.exit(1);
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
      structure.isNetwork = structure.is_reseau ? "true" : "false";
      structure.sqlNetworkId = s.reseau_id;
      structure.sqlUserId = s.user_id;
      if (s.longitude && s.latitude) structure.location = { lon: parseFloat(s.longitude), lat: parseFloat(s.latitude) };

      structure.legalStatus = (() => {
        if (s.statut_juridique === "Structure publique") return "PUBLIC";
        if (s.statut_juridique === "Structure privée") return "PRIVATE";
        if (s.statut_juridique === "Association") return "ASSOCIATION";
        return "OTHER";
      })();

      structure.associationTypes = JSON.parse(s.association_types);
      structure.structurePubliqueType = s.structure_publique_type;
      structure.structurePubliqueEtatType = s.structure_publique_etat_type;
      structure.structurePriveeType = s.structure_privee_type;

      structure.department = departmentList[s.department];
      structure.region = department2region[structure.department];

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

async function migrateNetwork() {
  const structuresSQL = await sequelize.query("SELECT * FROM `structures` where reseau_id is not null", { type: QueryTypes.SELECT });
  let count = 0;
  console.log(`${structuresSQL.length} structures network detected`);
  for (let i = 0; i < structuresSQL.length; i++) {
    const s = structuresSQL[i];

    try {
      const structure = await Structure.findOne({ sqlId: s.sqlNetworkId });
      if (structure) await Structure.findByIdAndUpdate(s._id, { networkId: structure._id });
    } catch (error) {
      console.log("error while linking structure", error);
    }
    count++;
    if (count % 100 === 0) logPrecentage(count, structuresSQL.length);
  }
}

async function migrateMission() {
  const missionsSQL = await sequelize.query("SELECT * FROM `missions`", { type: QueryTypes.SELECT });
  let a = [];
  let count = 0;
  console.log(`${missionsSQL.length} missions detected`);

  for (let i = 0; i < missionsSQL.length; i++) {
    const m = missionsSQL[i];
    try {
      const mission = { ...m };
      mission.sqlId = m.id;

      mission.sqlStructureId = m.structure_id;
      const structure = await Structure.findOne({ sqlId: m.structure_id });
      if (structure) {
        mission.structureId = structure._id;
        mission.structureName = structure.name;
      }

      mission.sqlTutorId = m.tuteur_id;
      const tutor = await Referent.findOne({ sqlId: m.tuteur_id });
      if (tutor) mission.tutorId = tutor._id;

      mission.placesTotal = m.participations_max;
      mission.placesLeft = m.participations_max;
      if (m.longitude && m.latitude) {
        mission.location = {
          lon: parseFloat(m.longitude),
          lat: parseFloat(m.latitude),
        };
      }
      mission.remote = m.is_everywhere ? "true" : "false";

      //todo translates domains
      mission.domains = JSON.parse(m.domaines);
      if (m.format === "Perlée") {
        mission.format = "DISCONTINUOUS";
      } else if (m.format === "Continue") {
        mission.format = "CONTINUOUS";
      } else if (m.format === "Autonome") {
        mission.format = "AUTONOMOUS";
      } else {
        console.log("ERROR FORMAT", m.format);
      }
      mission.status = (() => {
        if (m.state === "Brouillon") return "DRAFT";
        if (m.state === "En attente de validation") return "WAITING_VALIDATION";
        if (m.state === "En attente de correction") return "WAITING_CORRECTION";
        if (m.state === "Validée") return "VALIDATED";
        if (m.state === "Refusée") return "REFUSED";
        if (m.state === "Annulée") return "CANCEL";
        if (m.state === "Archivée") return "ARCHIVED";
      })();
      if (JSON.parse(m.periodes).length) mission.period = JSON.parse(m.periodes);
      mission.frequence = m.frequence;
      mission.department = departmentList[m.department];
      mission.region = department2region[mission.department];
      mission.endAt = m.end_date;
      mission.startAt = m.start_date;
      count++;
      if (count % 100 === 0) logPrecentage(count, missionsSQL.length);
      a.push(mission);
    } catch (error) {
      console.log(error);
    }
  }
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
  const profilesSql = await sequelize.query(
    //take everyone except the youngs
    "SELECT profiles.*, users.context_role FROM `profiles` LEFT JOIN `users` on profiles.user_id = users.id WHERE users.context_role <> 'volontaire' OR users.context_role is null",
    {
      type: QueryTypes.SELECT,
    }
  );
  let a = [];
  console.log(`${profilesSql.length} profiles detected`);
  profilesSql.forEach(async (u) => {
    try {
      const referent = { ...u };
      if (u.id) {
        referent.sqlId = u.id;

        //start anonymisation
        const fn = faker.name.firstName();
        referent.firstName = fn.charAt(0).toUpperCase() + fn.slice(1);
        const ln = faker.name.lastName();
        referent.lastName = ln.toUpperCase();
        referent.email = `${u.id}@mail.com`;
        //end anonymisation

        if (u.referent_region) {
          referent.role = "referent_region";
          referent.region = regionList[u.referent_region];
        } else if (u.referent_department) {
          referent.role = "referent_department";
          referent.department = departmentList[u.referent_department];
        } else if (u.context_role === "superviseur") {
          referent.role = "structure_responsible";
        } else {
          referent.role = "structure_member";
        }
        a.push(referent);
      }
    } catch (error) {
      console.log(error);
    }
  });
  try {
    await Referent.insertMany(a);
  } catch (error) {
    console.log("error while inserting referents", error);
  }
  console.log(`${a.length} added`);
}

async function migrateStructureMembers() {
  const members = await sequelize.query("SELECT * FROM `members`", {
    type: QueryTypes.SELECT,
  });
  console.log(`${members.length} members detected`);
  let count = 0;
  for (let i = 0; i < members.length; i++) {
    const m = members[i];

    try {
      const structure = await Structure.findOne({ sqlId: m.structure_id });
      if (structure) await Referent.findOneAndUpdate({ sqlId: m.profile_id }, { structureId: structure._id });
    } catch (error) {
      console.log("error while linking ref/structure", error);
    }
    count++;
    if (count % 100 === 0) logPrecentage(count, members.length);
  }
}

async function migrateApplication() {
  const missionYoungSQL = await sequelize.query("SELECT * FROM `mission_young`", { type: QueryTypes.SELECT });
  let a = [];
  console.log(`${missionYoungSQL.length} mission_youngs detected`);
  let count = 0;
  // good old for(;;) because of the inner promises in the loop.
  for (let i = 0; i < missionYoungSQL.length; i++) {
    const my = missionYoungSQL[i];
    try {
      const app = { ...my };

      const mission = await Mission.findOne({ sqlId: my.mission_id });
      if (mission) {
        app.missionId = mission._id;
        app.missionName = mission.name;
        app.missionDepartment = mission.department;
        app.missionRegion = mission.region;
      } else {
        app.missionId = "N/A";
      }

      const young = await Young.findOne({ sqlId: my.young_id });
      if (young) {
        app.youngId = young._id;
        app.youngFirstName = young.firstName;
        app.youngLastName = young.lastName;
        app.youngBirthdateAt = young.birthdateAt;
        app.youngEmail = young.email;
        app.youngCity = young.city;
        app.youngDepartment = young.department;
      } else {
        app.youngId = "N/A";
      }

      app.status = (() => {
        if (my.status === "CANDIDATURE_CREEE") return "WAITING_VALIDATION";
        if (my.status === "CANDIDATURE_VALIDEE") return "VALIDATED";
        if (my.status === "CANDIDATURE_REFUSEE") return "REFUSED";
        if (my.status === "CANDIDATURE_ANNULEE") return "CANCELED";
        if (my.status === "CANDIDATURE_PRESELECTIONNEE") return "PRESELECTED";
        if (my.status === "CANDIDATURE_CONTRAT_SIGNE") return "SIGNED_CONTRACT";
        if (my.status === "MISSION_EN_COURS") return "IN_PROGRESS";
        if (my.status === "MISSION_EFFECTUEE") return "DONE";
        if (my.status === "MISSION_NON_ACHEVEE") return "NOT_COMPLETED";
      })();

      app.createdAt = my.created_at;
      app.updatedAt = my.updated_at;
      count++;
      if (count % 100 === 0) logPrecentage(count, missionYoungSQL.length);
      a.push(app);
    } catch (error) {
      console.log(error);
    }
  }
  try {
    await Application.insertMany(a);
  } catch (error) {
    console.log("error while inserting applications", error);
  }
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
  Ain: "Auvergne-Rhône-Alpes",
  Aisne: "Hauts-de-France",
  Allier: "Auvergne-Rhône-Alpes",
  "Alpes-de-Haute-Provence": "Provence-Alpes-Côte d'Azur",
  "Hautes-Alpes": "Provence-Alpes-Côte d'Azur",
  "Alpes-Maritimes": "Provence-Alpes-Côte d'Azur",
  Ardèche: "Auvergne-Rhône-Alpes",
  Ardennes: "Grand Est",
  Ariège: "Occitanie",
  Aube: "Grand Est",
  Aude: "Occitanie",
  Aveyron: "Occitanie",
  "Bouches-du-Rhône": "Provence-Alpes-Côte d'Azur",
  Calvados: "Normandie",
  Cantal: "Auvergne-Rhône-Alpes",
  Charente: "Nouvelle-Aquitaine",
  "Charente-Maritime": "Nouvelle-Aquitaine",
  Cher: "Centre-Val de Loire",
  Corrèze: "Nouvelle-Aquitaine",
  "Côte-d'Or": "Bourgogne-Franche-Comté",
  "Côtes-d'Armor": "Bretagne",
  Creuse: "Nouvelle-Aquitaine",
  Dordogne: "Nouvelle-Aquitaine",
  Doubs: "Bourgogne-Franche-Comté",
  Drôme: "Auvergne-Rhône-Alpes",
  Eure: "Normandie",
  "Eure-et-Loire": "Centre-Val de Loire",
  Finistère: "Bretagne",
  "Corse-du-Sud": "Corse",
  "Haute-Corse": "Corse",
  Gard: "Occitanie",
  "Haute-Garonne": "Occitanie",
  Gers: "Occitanie",
  Gironde: "Nouvelle-Aquitaine",
  Hérault: "Occitanie",
  "Ille-et-Vilaine": "Bretagne",
  Indre: "Centre-Val de Loire",
  "Indre-et-Loire": "Centre-Val de Loire",
  Isère: "Auvergne-Rhône-Alpes",
  Jura: "Bourgogne-Franche-Comté",
  Landes: "Nouvelle-Aquitaine",
  "Loir-et-Cher": "Centre-Val de Loire",
  Loire: "Auvergne-Rhône-Alpes",
  "Haute-Loire": "Auvergne-Rhône-Alpes",
  "Loire-Atlantique": "Pays de la Loire",
  Loiret: "Centre-Val de Loire",
  Lot: "Occitanie",
  "Lot-et-Garonne": "Nouvelle-Aquitaine",
  Lozère: "Occitanie",
  "Maine-et-Loire": "Pays de la Loire",
  Manche: "Normandie",
  Marne: "Grand Est",
  "Haute-Marne": "Grand Est",
  Mayenne: "Pays de la Loire",
  "Meurthe-et-Moselle": "Grand Est",
  Meuse: "Grand Est",
  Morbihan: "Bretagne",
  Moselle: "Grand Est",
  Nièvre: "Bourgogne-Franche-Comté",
  Nord: "Hauts-de-France",
  Oise: "Hauts-de-France",
  Orne: "Normandie",
  "Pas-de-Calais": "Hauts-de-France",
  "Puy-de-Dôme": "Auvergne-Rhône-Alpes",
  "Pyrénées-Atlantiques": "Nouvelle-Aquitaine",
  "Hautes-Pyrénées": "Occitanie",
  "Pyrénées-Orientales": "Occitanie",
  "Bas-Rhin": "Grand Est",
  "Haut-Rhin": "Grand Est",
  Rhône: "Auvergne-Rhône-Alpes",
  "Haute-Saône": "Bourgogne-Franche-Comté",
  "Saône-et-Loire": "Bourgogne-Franche-Comté",
  Sarthe: "Pays de la Loire",
  Savoie: "Auvergne-Rhône-Alpes",
  "Haute-Savoie": "Auvergne-Rhône-Alpes",
  Paris: "Île-de-France",
  "Seine-Maritime": "Normandie",
  "Seine-et-Marne": "Île-de-France",
  Yvelines: "Île-de-France",
  "Deux-Sèvres": "Nouvelle-Aquitaine",
  Somme: "Hauts-de-France",
  Tarn: "Occitanie",
  "Tarn-et-Garonne": "Occitanie",
  Var: "Provence-Alpes-Côte d'Azur",
  Vaucluse: "Provence-Alpes-Côte d'Azur",
  Vendée: "Pays de la Loire",
  Vienne: "Nouvelle-Aquitaine",
  "Haute-Vienne": "Nouvelle-Aquitaine",
  Vosges: "Grand Est",
  Yonne: "Bourgogne-Franche-Comté",
  "Territoire de Belfort": "Bourgogne-Franche-Comté",
  Essonne: "Île-de-France",
  "Hauts-de-Seine": "Île-de-France",
  "Seine-Saint-Denis": "Île-de-France",
  "Val-de-Marne": "Île-de-France",
  "Val-d'Oise": "Île-de-France",
  Guadeloupe: "Guadeloupe",
  Martinique: "Martinique",
  Guyane: "Guyane",
  "La Réunion": "La Réunion",
  "Saint-Pierre-et-Miquelon": "Saint-Pierre-et-Miquelon",
  Mayotte: "Mayotte",
  "Saint-Barthélemy": "Saint-Barthélemy",
  "Saint-Martin": "Saint-Martin",
  "Terres australes et antarctiques françaises": "Terres australes et antarctiques françaises",
  "Wallis-et-Futuna": "Wallis-et-Futuna",
  "Polynésie française": "Polynésie française",
  "Nouvelle-Calédonie": "Nouvelle-Calédonie",
};
