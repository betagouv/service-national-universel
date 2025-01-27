import XLSX from "xlsx";
import { departmentLookUp } from "snu-lib";
import getNewPointDeRassemblementFixture from "../../fixtures/PlanDeTransport/pointDeRassemblement";

import { getNewCohesionCenterFixture } from "../../fixtures/cohesionCenter";
import { getNewSessionPhase1Fixture } from "../../fixtures/sessionPhase1";

import { createCohesionCenterWithSession } from "../cohesionCenter";
import { createPointDeRassemblementHelper } from "./pointDeRassemblement";

async function initPlanTransport(planTransport) {
  const matricules = planTransport.lines.reduce(
    (acc, line) => {
      const { "MATRICULE DU CENTRE": centreMatricule, "MATRICULE DU PDR 1": pdr1Matricule, "MATRICULE DU PDR 2": pdr2Matricule, "MATRICULE DU PDR 3": pdr3Matricule } = line;
      if (centreMatricule) acc.centreMatricules[centreMatricule] = centreMatricule;
      if (pdr1Matricule) acc.pdrMatricules[pdr1Matricule] = { department: departmentLookUp[line["N° DE DEPARTEMENT PDR 1"]] };
      if (pdr2Matricule) acc.pdrMatricules[pdr2Matricule] = { department: departmentLookUp[line["N° DE DEPARTEMENT PDR 2"]] };
      if (pdr3Matricule) acc.pdrMatricules[pdr3Matricule] = { department: departmentLookUp[line["N° DE DEPARTEMENT PDR 3"]] };
      return acc;
    },
    { centreMatricules: {}, pdrMatricules: {} },
  );
  for (const centreMatricule of Object.keys(matricules.centreMatricules)) {
    await createCohesionCenterWithSession(
      getNewCohesionCenterFixture({ cohorts: [planTransport.cohort], matricule: centreMatricule }),
      getNewSessionPhase1Fixture({ cohort: planTransport.cohort }),
    );
  }
  for (const pdrMatricule of Object.keys(matricules.pdrMatricules)) {
    await createPointDeRassemblementHelper(getNewPointDeRassemblementFixture({ department: matricules.pdrMatricules[pdrMatricule].department, matricule: pdrMatricule }));
  }
}

async function getXlsxBufferPlanTransport(planTransport) {
  planTransport.lines;
  let sheet = XLSX.utils.json_to_sheet(planTransport.lines);
  XLSX.utils.sheet_add_aoa(sheet, [Object.keys(planTransport.lines[0])], { origin: "A1" });
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "ALLER-RETOUR");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export { initPlanTransport, getXlsxBufferPlanTransport };
