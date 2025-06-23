import * as XLSX from "xlsx";
import { departmentLookUp } from "snu-lib";
import getNewPointDeRassemblementFixture from "../../fixtures/PlanDeTransport/pointDeRassemblement";

import { getNewCohesionCenterFixture } from "../../fixtures/cohesionCenter";
import { getNewSessionPhase1Fixture } from "../../fixtures/sessionPhase1";

import { createCohesionCenterWithSession } from "../cohesionCenter";
import { createPointDeRassemblementHelper } from "./pointDeRassemblement";

async function initPlanTransport(planTransport) {
  const ids = planTransport.lines.reduce(
    (acc, line) => {
      const { "ID CENTRE": centreId, "ID PDR 1": pdr1Id, "ID PDR 2": pdr2Id, "ID PDR 3": pdr3Id } = line;
      if (centreId) acc.centreIds[centreId] = { address: line["NOM + ADRESSE DU CENTRE"] };
      if (pdr1Id) acc.pdrIds[pdr1Id] = { department: departmentLookUp[line["N° DE DEPARTEMENT PDR 1"]], address: line["NOM + ADRESSE DU PDR 1"] };
      if (pdr2Id) acc.pdrIds[pdr2Id] = { department: departmentLookUp[line["N° DE DEPARTEMENT PDR 2"]], address: line["NOM + ADRESSE DU PDR 2"] };
      if (pdr3Id) acc.pdrIds[pdr3Id] = { department: departmentLookUp[line["N° DE DEPARTEMENT PDR 3"]], address: line["NOM + ADRESSE DU PDR 3"] };
      return acc;
    },
    { centreIds: {}, pdrIds: {} },
  );
  for (const centreId of Object.keys(ids.centreIds)) {
    await createCohesionCenterWithSession(
      getNewCohesionCenterFixture({ _id: centreId, cohorts: [planTransport.cohort], zip: findLast5Digits(ids.centreIds[centreId].address) }),
      getNewSessionPhase1Fixture({ cohort: planTransport.cohort }),
    );
  }
  for (const pdrId of Object.keys(ids.pdrIds)) {
    await createPointDeRassemblementHelper(
      getNewPointDeRassemblementFixture({ _id: pdrId, department: ids.pdrIds[pdrId].department, zip: findLast5Digits(ids.pdrIds[pdrId].address) }),
    );
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

function findLast5Digits(str: string) {
  const matches = str.match(/\d{5}/g);
  return matches ? matches[matches.length - 1] : undefined;
}

export { initPlanTransport, getXlsxBufferPlanTransport };
