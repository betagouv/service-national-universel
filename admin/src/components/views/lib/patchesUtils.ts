import { formatStringLongDate, translate, translateApplication, translateEngagement, translateModelFields, translatePhase1, translatePhase2 } from "@/utils";
import { isIsoDate } from "snu-lib";

const splitElementArray = (model, value) => {
  // si on modifie la valeur d'un element d'un champs array
  // on doit le parser car il est affiché sous la forme : field/index
  const elementOfArray = value.match(/(\w*)\/(\d)/);
  if (elementOfArray?.length) {
    //console.log("✍️ ~ elementOfArry", elementOfArry);
    return `${translateModelFields(model, elementOfArray[1])} (nº${Number(elementOfArray[2]) + 1})`;
  }
  return value;
};

export const translator = (path, value) => {
  if (path === "/statusPhase1") {
    return translatePhase1(value);
  } else if (path === "/statusPhase2") {
    return translatePhase2(value);
  } else if (path === "/phase2ApplicationStatus") {
    return translateApplication(value);
  } else if (path === "/statusPhase2Contract") {
    return translateEngagement(value);
  } else {
    return translate(value);
  }
};

export function patchHasMeaningfulChanges(patch) {
  const opsWithMeaningfulChanges = patch.ops.filter((op) => {
    return !op.path.includes("/jvaRawData") && !op.path.includes("/lastSyncAt");
  });
  return opsWithMeaningfulChanges.length > 0;
}

export function filterResult(model, hit, filter, showOnlyMeaningful) {
  if (showOnlyMeaningful && !patchHasMeaningfulChanges(hit)) return false;
  return hit.ops?.some((e) => {
    const originalValue = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.originalValue)?.replace(/"/g, ""));
    const value = translator(JSON.stringify(e.path)?.replace(/"/g, ""), JSON.stringify(e.value)?.replace(/"/g, ""));

    const matchFieldName = translateModelFields(model, e.path.substring(1)).toLowerCase().includes(filter.toLowerCase().trim());
    const matchOriginalValue = (isIsoDate(originalValue) ? formatStringLongDate(originalValue) : originalValue)?.toLowerCase().includes(filter.toLowerCase().trim());
    const matchFromValue = (isIsoDate(value) ? formatStringLongDate(value) : value)?.toLowerCase().includes(filter.toLowerCase().trim());

    return matchFieldName || matchOriginalValue || matchFromValue;
  });
}

export function getFieldName(model, path) {
  if (path.includes("jvaRawData")) return path;
  return `${splitElementArray(model, translateModelFields(model, path.substring(1)))}`;
}
