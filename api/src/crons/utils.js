const YoungModel = require("../models/young");
const StructureModel = require("../models/structure");
const { regionList, departmentList } = require("snu-lib");

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
const regionListTest = ["Auvergne-Rhône-Alpes", "Bretagne"];

module.exports = {
  getMinusDate,
  getDataInscriptions,
  getDataStructure,
  departmentListTest,
  departmentList,
  regionListTest,
  regionList,
};
