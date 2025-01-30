import { ClasseModel, EtablissementModel, LigneBusModel, SessionPhase1Model } from "../models";

function formatLabel(data, key: string) {
  return data.reduce((acc, cur) => {
    acc[cur._id] = cur[key];
    return acc;
  }, {});
}

export async function getLigneLabel() {
  const data = await LigneBusModel.find({}, { busId: 1 });
  return formatLabel(data, "busId");
}

export async function getClasseLabel() {
  // Pourquoi ça renvoit les patches ça ?
  const data = await ClasseModel.find({}, { uniqueKeyAndId: 1 });
  return formatLabel(data, "uniqueKeyAndId");
}

export async function getEtablissementLabel() {
  const data = await EtablissementModel.find({}, { name: 1 });
  return formatLabel(data, "name");
}

export async function getSessionLabel() {
  const data = await SessionPhase1Model.find({}, { codeCentre: 1 });
  return formatLabel(data, "codeCentre");
}
