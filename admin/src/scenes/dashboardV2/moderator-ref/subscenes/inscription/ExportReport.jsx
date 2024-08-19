import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { toastr } from "react-redux-toastr";
import api from "../../../../../services/api";
import { REFERENT_ROLES, YOUNG_STATUS, department2region, departmentLookUp, departmentToAcademy, region2department, translate, translateInscriptionStatus } from "snu-lib";
import { translateModelFields } from "../../../../../utils";

export default async function ExportReport({ filter, user, setLoading, setLoadingText }) {
  if (!filter?.cohort?.length) return toastr.error("Merci de selectionner au moins une cohorte ");
  if (user.role === REFERENT_ROLES.REFERENT_REGION) {
    if (!filter?.region?.length) {
      filter.region = [user.region];
    }
    if (!filter?.department?.length) {
      filter.department = region2department[user.region];
    }
  }
  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
    if (!filter?.department?.length) {
      filter.department = user.department.map((s) => s);
    }
  }

  // starting the process...
  setLoading(true);

  // get all the inscriptions goals for the selected cohorts
  const inscriptionGoalsRequest = (filter?.cohort || []).map((cohort) => api.get(`/inscription-goal/${encodeURI(cohort)}`));
  let inscriptionGoals = await Promise.all([...inscriptionGoalsRequest]);
  inscriptionGoals = inscriptionGoals?.reduce((previous, current) => {
    if (current.ok && current.data?.length) {
      previous.push(...current.data);
    }
    return previous;
  }, []);
  const lines = [];

  lines.push(["Académie", "Région", "Numéro dpt", "Département", "Objectif", ...Object.values(YOUNG_STATUS).map((e) => translateInscriptionStatus(e))]);
  const keys = Object.keys(departmentLookUp)
    // remove the special case for Corse
    ?.filter((number) => number !== "20")
    // get all the academy if there is no filter specified, else get only the department of the academy filtered
    ?.filter((number) => !filter?.academy?.length || filter?.academy?.includes(departmentToAcademy[departmentLookUp[number]]))
    // get all the region if there is no filter specified, else get only the department of the region filtered
    ?.filter((number) => !filter?.region?.length || filter?.region?.includes(department2region[departmentLookUp[number]]))
    // get all the department if there is no filter specified, else get only the department filtered
    ?.filter((number) => !filter?.department?.length || filter?.department?.includes(departmentLookUp[number]))
    ?.sort((a, b) => a - b);
  for (let i = 0; i < keys.length; i++) {
    const dptCode = keys[i];
    const dptName = departmentLookUp[dptCode];
    const region = department2region[dptName];
    const academy = departmentToAcademy[dptName];

    const responses = await api.post("/elasticsearch/dashboard/inscription/youngsReport", { filters: filter, department: dptName });
    if (responses) {
      const status = api.getAggregations(responses);
      const goal = inscriptionGoals.filter((g) => g.department === dptName)?.reduce((p, c) => p + (c.max || 0), 0);
      const line = [academy, region, dptCode, dptName, goal, ...Object.values(YOUNG_STATUS).map((filterStatus) => status[filterStatus] || 0)];
      lines.push(line);
    }
    setLoadingText(`${((i / keys.length) * 100).toFixed(0)} %`);
  }
  const linesFilter = [["filtre", "valeur(s)"]];
  Object.keys(filter)?.forEach((f) => {
    linesFilter.push([translateModelFields("young", f), filter[f]?.map(translate)?.join(", ")]);
  });

  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const sheetData = XLSX.utils.aoa_to_sheet(lines);
  const sheetFilter = XLSX.utils.aoa_to_sheet(linesFilter);
  const wb = { Sheets: { Données: sheetData, Filtres: sheetFilter }, SheetNames: ["Données", "Filtres"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  setLoading(false);
  const now = new Date();
  const exportDate = `${now.getFullYear()}${now.getMonth() + 1}${("0" + now.getDate()).slice(-2)}`;
  const exportTime = `${now.getHours()}${now.getMinutes()}`;
  FileSaver.saveAs(data, `${exportDate}_${exportTime}_Global.xlsx`);
  setLoadingText(`0 %`);
}
