import { ClasseModel, EtablissementModel, LigneBusModel, SessionPhase1Model } from "../models";

function buildPipeline(key: string) {
  return [
    { $project: { _id: 1, [key]: 1 } },
    { $group: { _id: null, keyValuePairs: { $push: { k: { $toString: "$_id" }, v: { $toString: `$${key}` } } } } },
    { $replaceRoot: { newRoot: { $arrayToObject: "$keyValuePairs" } } },
  ];
}

export async function getLigneLabelMap() {
  const pipeline = buildPipeline("busId");
  const data = await LigneBusModel.aggregate(pipeline);
  return data[0];
}
export async function getClasseLabelMap() {
  const pipeline = buildPipeline("uniqueKeyAndId");
  const data = await ClasseModel.aggregate(pipeline);
  return data[0];
}
export async function getEtablissementLabelMap() {
  const pipeline = buildPipeline("name");
  const data = await EtablissementModel.aggregate(pipeline);
  return data[0];
}
export async function getSessionLabelMap() {
  const pipeline = buildPipeline("codeCentre");
  const data = await SessionPhase1Model.aggregate(pipeline);
  return data[0];
}
