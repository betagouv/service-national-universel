const YoungModel = require("../models/young");
const StructureModel = require("../models/structure");

const getMinusDate = (v) => {
  const d = new Date();
  d.setDate(d.getDate() - v);
  return d;
};

const getDataInscriptions = async ({ department, region, days = 7 }) => {
  const obj = {};
  const filter = { cohort: 2021 };
  if (department) filter.department = department;
  if (region) filter.region = region;
  const newInscriptions = await YoungModel.find({ ...filter, lastStatusAt: { $gte: getMinusDate(days) } });
  const inscriptions = await YoungModel.find(filter);
  obj.new_inscription_waiting_validation = newInscriptions.filter((e) => e.status === "WAITING_VALIDATION").length;
  obj.new_inscription_validated = newInscriptions.filter((e) => e.status === "VALIDATED").length;
  obj.inscription_waiting_validation = inscriptions.filter((e) => e.status === "WAITING_VALIDATION").length;
  obj.inscription_validated = inscriptions.filter((e) => e.status === "VALIDATED").length;
  return obj;
};

const getDataStructure = async ({ department, region, days = 7 }) => {
  const obj = {};
  const filter = {};
  if (department) filter.department = department;
  if (region) filter.region = region;
  const structures = await StructureModel.find({ ...filter, lastStatusAt: { $gte: getMinusDate(days) } });
  obj.new_structure = structures.length;
  return obj;
};

const departmentListTest = ["Ain", "Loire"];
const departmentList = [
  "Ain",
  "Aisne",
  "Allier",
  "Alpes-de-Haute-Provence",
  "Hautes-Alpes",
  "Alpes-Maritimes",
  "Ardèche",
  "Ardennes",
  "Ariège",
  "Aube",
  "Aude",
  "Aveyron",
  "Bouches-du-Rhône",
  "Calvados",
  "Cantal",
  "Charente",
  "Charente-Maritime",
  "Cher",
  "Corrèze",
  "Corse",
  "Côte-d'Or",
  "Côtes-d'Armor",
  "Creuse",
  "Dordogne",
  "Doubs",
  "Drôme",
  "Eure",
  "Eure-et-Loir",
  "Finistère",
  "Corse-du-Sud",
  "Haute-Corse",
  "Gard",
  "Haute-Garonne",
  "Gers",
  "Gironde",
  "Hérault",
  "Ille-et-Vilaine",
  "Indre",
  "Indre-et-Loire",
  "Isère",
  "Jura",
  "Landes",
  "Loir-et-Cher",
  "Loire",
  "Haute-Loire",
  "Loire-Atlantique",
  "Loiret",
  "Lot",
  "Lot-et-Garonne",
  "Lozère",
  "Maine-et-Loire",
  "Manche",
  "Marne",
  "Haute-Marne",
  "Mayenne",
  "Meurthe-et-Moselle",
  "Meuse",
  "Morbihan",
  "Moselle",
  "Nièvre",
  "Nord",
  "Oise",
  "Orne",
  "Pas-de-Calais",
  "Puy-de-Dôme",
  "Pyrénées-Atlantiques",
  "Hautes-Pyrénées",
  "Pyrénées-Orientales",
  "Bas-Rhin",
  "Haut-Rhin",
  "Rhône",
  "Haute-Saône",
  "Saône-et-Loire",
  "Sarthe",
  "Savoie",
  "Haute-Savoie",
  "Paris",
  "Seine-Maritime",
  "Seine-et-Marne",
  "Yvelines",
  "Deux-Sèvres",
  "Somme",
  "Tarn",
  "Tarn-et-Garonne",
  "Var",
  "Vaucluse",
  "Vendée",
  "Vienne",
  "Haute-Vienne",
  "Vosges",
  "Yonne",
  "Territoire de Belfort",
  "Essonne",
  "Hauts-de-Seine",
  "Seine-Saint-Denis",
  "Val-de-Marne",
  "Val-d'Oise",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Saint-Pierre-et-Miquelon",
  "Mayotte",
  "Saint-Martin",
  "Polynésie française",
  "Nouvelle-Calédonie",
];

const regionListTest = ["Auvergne-Rhône-Alpes", "Bretagne"];
const regionList = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Saint-Pierre-et-Miquelon",
  "Mayotte",
  "Saint-Barthélemy",
  "Saint-Martin",
  "Terres australes et antarctiques françaises",
  "Wallis-et-Futuna",
  "Polynésie française",
  "Nouvelle-Calédonie",
];

module.exports = {
  getMinusDate,
  getDataInscriptions,
  getDataStructure,
  departmentListTest,
  departmentList,
  regionListTest,
  regionList,
};
