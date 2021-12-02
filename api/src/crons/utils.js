const YoungModel = require("../models/young");
const InscriptionGoal = require("../models/inscriptionGoal");
const StructureModel = require("../models/structure");
const { regionList, departmentList } = require("snu-lib");

const getMinusDate = (v) => {
  const d = new Date();
  d.setDate(d.getDate() - v);
  return d;
};

const getDataInscriptions = async ({ department, region }) => {
  let obj = { all: {}, february: {}, june: {}, july: {} };
  const filter = { cohort: { $in: ["Février 2022", "Juin 2022", "Juillet 2022"] } };
  if (department) filter.department = department;
  if (region) filter.region = region;
  const newInscriptions = await YoungModel.find({ ...filter });
  const inscriptionGoals = await InscriptionGoal.find({ ...filter });
  console.log("✍️ ~ inscriptionGoals", inscriptionGoals);

  obj.all.WAITING_VALIDATION = newInscriptions.filter((e) => e.status === "WAITING_VALIDATION").length;
  obj.all.VALIDATED = newInscriptions.filter((e) => e.status === "VALIDATED").length;

  obj.february.WAITING_VALIDATION = newInscriptions.filter((e) => e.status === "WAITING_VALIDATION" && e.cohort === "Février 2022").length;
  obj.february.VALIDATED = newInscriptions.filter((e) => e.status === "VALIDATED" && e.cohort === "Février 2022").length;
  const goalFebruary = inscriptionGoals.find((e) => e.cohort === "Février 2022")?.max;
  if (goalFebruary > 0) {
    obj.february.goalPercentage = (((obj.february.VALIDATED || 0) / goalFebruary) * 100).toFixed(0);
  }

  obj.june.WAITING_VALIDATION = newInscriptions.filter((e) => e.status === "WAITING_VALIDATION" && e.cohort === "Juin 2022").length;
  obj.june.VALIDATED = newInscriptions.filter((e) => e.status === "VALIDATED" && e.cohort === "Juin 2022").length;
  const goalJune = inscriptionGoals.find((e) => e.cohort === "Juin 2022")?.max;
  if (goalJune > 0) {
    obj.june.goalPercentage = (((obj.june.VALIDATED || 0) / goalJune) * 100).toFixed(0);
  }

  obj.july.WAITING_VALIDATION = newInscriptions.filter((e) => e.status === "WAITING_VALIDATION" && e.cohort === "Juillet 2022").length;
  obj.july.VALIDATED = newInscriptions.filter((e) => e.status === "VALIDATED" && e.cohort === "Juillet 2022").length;
  const goalJuly = inscriptionGoals.find((e) => e.cohort === "Juillet 2022")?.max;
  if (goalJuly > 0) {
    obj.july.goalPercentage = (((obj.july.VALIDATED || 0) / goalJuly) * 100).toFixed(0);
  }

  return obj;
};

const departmentListTest = ["Ain", "Loire"];
const regionListTest = ["Auvergne-Rhône-Alpes", "Bretagne"];

module.exports = {
  getMinusDate,
  getDataInscriptions,
  departmentListTest,
  departmentList,
  regionListTest,
  regionList,
};
