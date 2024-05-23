import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import dayjs from "dayjs";

import api from "@/services/api";
import { capture } from "@/sentry";
import { translateStatusClasse } from "snu-lib";

export async function exportSRCLE(cohort) {
  try {
    const res = await api.post("/elasticsearch/cle/classe/export?type=schema-de-repartition", {
      filters: { cohort: [cohort] },
    });
    const result = await exportExcelSheetForCLE({ data: res.data });
    const buffer = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
    FileSaver.saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }), result.fileName);
  } catch (error) {
    capture(error);
  }
}

function exportExcelSheetForCLE({ data: classes, type }) {
  let sheetData = classes.map((c) => ({
    id: c._id.toString(),
    uniqueKeyAndId: c.uniqueKeyAndId,
    name: c.name,
    cohort: c.cohort,
    students: (c.seatsTaken ?? 0) + "/" + (c.totalSeats ?? 0),
    coloration: c.coloration,
    status: translateStatusClasse(c.status),
    updatedAt: dayjs(c.updatedAt).format("DD/MM/YYYY HH:mm"),
    createdAt: dayjs(c.createdAt).format("DD/MM/YYYY HH:mm"),
  }));
  const headers = [
    "Cohorte",
    "ID de la classe",
    "Nom de la classe",
    "Coloration",
    "Date de dernière modification",
    "Région des volontaires",
    "Département des volontaires",
    "UAI de l'établissement",
    "Nom de l'établissement",
    "Nom du référent de classe",
    "Prénom du référent de classe",
    "Email du référent de classe",
    "Nombre de places total",
    "Nombre d'élèves en cours",
    "Nombre d'élèves en attente",
    "Nombre d'élèves validés",
    "Nombre d'élèves abandonnés",
    "Nombre d'élèves non autorisés",
    "Nombre d'élèves désistés",
    "ID centre",
    "Désignation du centre",
    "Département du centre",
    "Région du centre",
    "ID du point de rassemblement",
    "Désignation du point de rassemblement",
    "Adresse du point de rassemblement",
  ];

  sheetData = classes.map((c) => ({
    cohort: c.cohort,
    id: c._id.toString(),
    name: c.name,
    coloration: c.coloration,
    updatedAt: dayjs(c.updatedAt).format("DD/MM/YYYY HH:mm"),
    region: c.etablissement?.region,
    department: c.etablissement?.department,
    uai: c.etablissement?.uai,
    etablissementName: c.etablissement?.name,
    classeRefLastName: c.referentClasse ? c.referentClasse[0]?.lastName : "",
    classeRefFirstName: c.referentClasse ? c.referentClasse[0]?.firstName : "",
    classeRefEmail: c.referentClasse ? c.referentClasse[0]?.email : "",
    youngsVolume: c.totalSeats ?? 0,
    studentInProgress: c.studentInProgress,
    studentWaiting: c.studentWaiting,
    studentValidated: c.studentValidated,
    studentAbandoned: c.studentAbandoned,
    studentNotAutorized: c.studentNotAutorized,
    studentWithdrawn: c.studentWithdrawn,
    centerId: c.cohesionCenterId,
    centerName: c.cohesionCenter ? `${c.cohesionCenter?.name}, ${c.cohesionCenter?.address}, ${c.cohesionCenter?.zip} ${c.cohesionCenter?.city}` : "",
    centerDepartment: c.cohesionCenter?.department,
    centerRegion: c.cohesionCenter?.region,
    pointDeRassemblementId: c.pointDeRassemblementId,
    pointDeRassemblementName: c.pointDeRassemblement?.name,
    pointDeRassemblementAddress: c.pointDeRassemblement ? `${c.pointDeRassemblement?.address}, ${c.pointDeRassemblement?.zip} ${c.pointDeRassemblement?.city}` : "",
  }));

  // tri par centre
  sheetData.sort((a, b) => {
    const aname = a.centerName;
    const bname = b.centerName;

    if (aname) {
      if (bname) return aname.localeCompare(bname);
      return -1;
    } else {
      if (bname) return 1;
      return 0;
    }
  });

  const sheet = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: "A1" });

  // --- create workbook
  const workbook = XLSX.utils.book_new();
  // ⚠️ Becareful, sheet name length is limited to 31 characters
  XLSX.utils.book_append_sheet(workbook, sheet, type === "schema-de-repartition" ? "Répartition des classes" : "Liste des classes");
  const fileName = "classes-schema-repartition.xlsx";
  return { workbook, fileName };
}

export async function exportSRHTS(cohort, region, department) {
  try {
    let url = "/schema-de-repartition/export";
    if (region) {
      url += "/" + region;
    }
    if (department) {
      url += "/" + department;
    }
    url += "/" + cohort;

    const res = await api.get(url);
    const result = await exportExcelSheetForHTS({ data: res.data });
    const buffer = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
    FileSaver.saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }), result.fileName);
  } catch (error) {
    capture(error);
  }
}

async function exportExcelSheetForHTS(groups) {
  let maxGatheringPlaces = 0;

  const sheetData = groups.map((g) => {
    const data = {
      cohort: g.cohort,
      id: g._id.toString(),
      updatedAt: dayjs(g.updatedAt).format("DD/MM/YYYY HH:mm"),
      region: g.fromRegion,
      department: g.fromDepartment,
      youngsVolume: g.youngsVolume,
      centerId: g.centerId,
      centerName: `${g.center.name} ${g.center.address} ${g.center.zip} ${g.center.city}`,
      centerDepartment: g.center.department,
      centerRegion: g.center.region,
    };
    if (maxGatheringPlaces < g.gatheringPlaces.length) {
      maxGatheringPlaces = g.gatheringPlaces.length;
    }
    for (let i = 0, n = g.gatheringPlaces.length; i < n; ++i) {
      const pdr = g.gatheringPlaces[i];
      data["gpId" + i] = pdr._id;
      data["gpName" + i] = `${pdr.name} ${pdr.address} ${pdr.zip} ${pdr.city}`;
    }
    return data;
  });

  // tri par centre
  sheetData.sort((a, b) => {
    const aname = a.centerName;
    const bname = b.centerName;

    if (aname) {
      if (bname) {
        return aname.localeCompare(bname);
      } else {
        return -1;
      }
    } else {
      if (bname) {
        return 1;
      } else {
        return 0;
      }
    }
  });

  const sheet = XLSX.utils.json_to_sheet(sheetData);

  // --- fix header names
  const headers = [
    "Cohorte",
    "ID",
    "Date de dernière modification",
    "Région des volontaires",
    "Département des volontaires",
    "Nombre de volontaires",
    "ID centre",
    "Désignation du centre",
    "Département du centre",
    "Région du centre",
  ];
  for (let i = 1; i <= maxGatheringPlaces; ++i) {
    headers.push(...["ID du point de rassemblement " + i, "Désignation du point de rassemblement " + i]);
  }
  XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: "A1" });

  // --- create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Schéma de répartition");
  const fileName = "schema-repartition.xlsx";
  return { workbook, fileName };
}
