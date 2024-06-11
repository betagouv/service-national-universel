import { departmentLookUp } from "snu-lib";

import { IBus } from "../../models/PlanDeTransport/ligneBus.type";

export function isValidDate(date) {
  return date.match(/^[0-9]{2}\/[0-9]{2}\/202[0-9]$/);
}

export function formatTime(time) {
  let [hours, minutes] = time.split(":");
  hours = hours.length === 1 ? "0" + hours : hours;
  return `${hours}:${minutes}`;
}

export function isValidTime(time) {
  const test = formatTime(time);
  return test.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
}

export function isValidNumber(number) {
  return number.match(/^[0-9]+$/);
}

export function isValidBoolean(b) {
  return b
    .trim()
    .toLowerCase()
    .match(/^(oui|non)$/);
}

export function isValidDepartment(department) {
  const ids = Object.keys(departmentLookUp);
  return ids.includes((department || "").toUpperCase());
}

export const getLinePdrCount = (line) => {
  return Object.keys(line).filter((e) => e.startsWith("ID PDR")).length;
};

export const getLinePdrIds = (line) => {
  const countPdr = getLinePdrCount(line);
  const pdrIds: string[] = [];
  for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
    if (line[`ID PDR ${pdrNumber}`] && !["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${pdrNumber}`]?.toLowerCase())) {
      pdrIds.push(line[`ID PDR ${pdrNumber}`]);
    }
  }
  return pdrIds;
};

export const getMergedBusIdsFromLigneBus = (lignesDeBus: IBus[]) => {
  const lines = lignesDeBus
    .filter((ligne: IBus | null) => !!ligne)
    .map((ligne: IBus) => ({ "NUMERO DE LIGNE": ligne.busId, "LIGNES FUSIONNÉES": ligne.mergedBusIds?.join(",") || "" }));
  // on fait un calcul complet pour corriger les éventuels incohérences d'un import précedent
  return computeMergedBusIds(lines);
};

// fusionne deux lignes de manière récursive
const mergeLignes = (mergedBusIds, busId, mergedLine, recursive = 0) => {
  if (!mergedBusIds[mergedLine]) {
    mergedBusIds[mergedLine] = [];
  }
  if (!mergedBusIds[mergedLine].includes(mergedLine)) {
    // ajoute la nouvelle ligne fusionnée à la ligne correspondance (C <- C)
    mergedBusIds[mergedLine].push(mergedLine);
  }
  if (!mergedBusIds[busId].includes(mergedLine)) {
    // ajoute la nouvelle ligne fusionnée à la ligne courante (B <- C)
    mergedBusIds[busId].push(mergedLine);
  }
  if (!mergedBusIds[mergedLine].includes(busId)) {
    // ajoute la ligne courante à la nouvelle ligne fusionnée (C <- B)
    mergedBusIds[mergedLine].push(busId);
  }
  if (recursive > 1) {
    return;
  }
  // Mise à jour des lignes fusionnées en cascade (2 niveaux)
  for (const existingMergedBusId of Object.keys(mergedBusIds)) {
    if (existingMergedBusId !== busId && mergedBusIds[existingMergedBusId].includes(busId)) {
      mergeLignes(mergedBusIds, existingMergedBusId, mergedLine, recursive + 1);
      mergeLignes(mergedBusIds, existingMergedBusId, busId, recursive + 1);
    }
  }
};

// calcul de la listes des lignes fusionnées associées à la colonne LIGNES FUSIONNÉES
export const computeMergedBusIds = (lines: Record<string, string>[], existingMergedBusIds: Record<string, string[]> = {}) => {
  const mergedBusIds = existingMergedBusIds;
  for (const line of lines) {
    const busId = line["NUMERO DE LIGNE"];
    const mergedLines = (line["LIGNES FUSIONNÉES"]?.split(",") || []).filter((mergedLine) => !!mergedLine);

    // console.log("busId", busId, mergedBusIds);
    if (!mergedBusIds[busId]) {
      mergedBusIds[busId] = [];
    }

    // Ajoute la ligne fusionnée à soit même (si il y a une ligne fusionnée)
    if (mergedLines.length > 0 && !mergedBusIds[busId].includes(busId)) {
      mergedBusIds[busId].push(busId); // (B <- B)
    }

    for (const mergedLine of mergedLines) {
      mergeLignes(mergedBusIds, busId, mergedLine);
    }
  }

  // Assure que chaque tableau d'ID de bus est unique et trié
  Object.keys(mergedBusIds).forEach((busId) => {
    mergedBusIds[busId] = [...new Set(mergedBusIds[busId])].sort();
  });

  return mergedBusIds;
};
