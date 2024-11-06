import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { toastr } from "react-redux-toastr";
import api from "../../../../../../services/api";
import { REFERENT_ROLES, STRUCTURE_LEGAL_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3, region2department, translate } from "snu-lib";

export default async function ExportEngagementReport({ filter, user, setLoading, setLoadingText }) {
  if (!filter?.cohorts?.length) return toastr.error("Merci de selectionner au moins une cohorte ");
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

  setLoadingText("0 %");
  const youngStatuses = await computeYoungStatuses(filter);
  setLoadingText("50 %");
  const structures = await computeStructures(filter);
  setLoadingText("100 %");

  const linesFilter = [];
  if (filter.cohorts && filter.cohorts.length > 0) {
    linesFilter.push({ Type: "Cohortes", Valeur: filter.cohorts.join(", ") });
  }
  if (filter.region && filter.region.length > 0) {
    linesFilter.push({ Type: "Régions", Valeur: filter.region.join(", ") });
  }
  if (filter.department && filter.department.length > 0) {
    linesFilter.push({ Type: "Département", Valeur: filter.department.join(", ") });
  }
  if (filter.academy && filter.academy.length > 0) {
    linesFilter.push({ Type: "Académie", Valeur: filter.academy.join(", ") });
  }
  if (filter.status && filter.status.length > 0) {
    linesFilter.push({ Type: "Statut d'inscription", Valeur: filter.status.join(", ") });
  }

  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const sheetYoungs = XLSX.utils.json_to_sheet(youngStatuses);
  const sheetStructures = XLSX.utils.json_to_sheet(structures);
  const sheetFilter = XLSX.utils.json_to_sheet(linesFilter);
  const wb = { Sheets: { Volontaires: sheetYoungs, Structures: sheetStructures, Filtres: sheetFilter }, SheetNames: ["Volontaires", "Structures", "Filtres"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  setLoading(false);
  const now = new Date();
  const exportDate = `${now.getFullYear()}${now.getMonth() + 1}${("0" + now.getDate()).slice(-2)}`;
  const exportTime = `${now.getHours()}${now.getMinutes()}`;
  FileSaver.saveAs(data, `${exportDate}_${exportTime}_Engagement.xlsx`);
  setLoadingText(`0 %`);
}

async function computeYoungStatuses(filter) {
  const youngs = await api.post("/elasticsearch/young/aggregate-status/export", {
    filters: filter,
  });
  let lines = [];
  for (const row of youngs.data) {
    let line = {
      ["Académie"]: row.academy,
      ["Région"]: row.region,
      ["Département"]: row.department,
    };
    for (const status of Object.values(YOUNG_STATUS_PHASE1)) {
      line["Phase 1 - " + translate(status)] = row["phase1_" + status];
    }
    for (const status of Object.values(YOUNG_STATUS_PHASE2)) {
      line["Phase 2 - " + translate(status)] = row["phase2_" + status];
    }
    for (const status of Object.values(YOUNG_STATUS_PHASE3)) {
      line["Phase 3 - " + translate(status)] = row["phase3_" + status];
    }
    lines.push(line);
  }
  return lines;
}

async function computeStructures(filter) {
  // --- get data
  const structures = await api.post("/elasticsearch/structure/export", {
    filters: filter,
  });

  // --- aggregate
  let types = {};
  let departments = {};
  for (const structure of structures.data) {
    if (departments[structure.department] === undefined) {
      departments[structure.department] = {
        department: structure.department,
        region: structure.region,
        count: 0,
        networkAffiliated: 0,
      };
    }
    departments[structure.department].count++;
    if (structure.networkId) {
      departments[structure.department].networkAffiliated++;
    }
    if (departments[structure.department][structure.legalStatus] === undefined) {
      departments[structure.department][structure.legalStatus] = 0;
    }
    departments[structure.department][structure.legalStatus]++;
    if (structure.types) {
      for (const type of structure.types) {
        types[type] = type;
        if (departments[structure.department][type] === undefined) {
          departments[structure.department][type] = 0;
        }
        departments[structure.department][type]++;
      }
    }
  }

  // --- format
  let lines = [];
  for (const row of Object.values(departments)) {
    const line = {
      ["Département"]: row.department,
      ["Région"]: row.region,
      ["Nb Structures"]: row.count,
      ["Nb Affiliés à un réseau"]: row.networkAffiliated,
    };
    for (const status of Object.values(STRUCTURE_LEGAL_STATUS)) {
      line[translate(status)] = row[status] || 0;
    }
    for (const type of Object.keys(types)) {
      line[type] = row[type] || 0;
    }
    lines.push(line);
  }
  return lines;
}
