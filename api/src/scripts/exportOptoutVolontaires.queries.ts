import { YoungModel, ApplicationModel, MissionEquivalenceModel, MissionModel, EtablissementModel, ClasseModel, MissionAPIModel } from "../models";
import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS } from "./exportOptoutVolontaires.fields";
import { chunk, buildProjection } from "./exportOptoutVolontaires.helpers";

async function findByIn(model: any, field: string, values: string[], projection: Record<string, 1>, chunkSize: number): Promise<any[]> {
  const out: any[] = [];
  for (const part of chunk(values, chunkSize)) {
    if (part.length === 0) continue;
    const docs = await model.find({ [field]: { $in: part } }, projection).lean(); // lecture seule
    out.push(...docs);
  }
  return out;
}

export function findYoungsByEmails(emails: string[], chunkSize: number) {
  const proj = { ...buildProjection([...MODEL_FIELDS.young, ...YOUNG_REPRESENTATIVE_FIELDS]), _id: 1, classeId: 1, etablissementId: 1 } as Record<string, 1>;
  return findByIn(YoungModel, "email", emails, proj, chunkSize);
}
export function findApplicationsByYoungIds(youngIds: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.application), _id: 1, youngId: 1, missionId: 1 } as Record<string, 1>;
  return findByIn(ApplicationModel, "youngId", youngIds, proj, chunkSize);
}
export function findEquivalencesByYoungIds(youngIds: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.missionEquivalence), _id: 1, youngId: 1 } as Record<string, 1>;
  return findByIn(MissionEquivalenceModel, "youngId", youngIds, proj, chunkSize);
}
export function findMissionsByIds(missionIds: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.mission), _id: 1, apiEngagementId: 1 } as Record<string, 1>;
  return findByIn(MissionModel, "_id", missionIds, proj, chunkSize);
}
export function findEtablissementsByIds(ids: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.etablissement), _id: 1 } as Record<string, 1>;
  return findByIn(EtablissementModel, "_id", ids, proj, chunkSize);
}
export function findClassesByIds(ids: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.classe), _id: 1 } as Record<string, 1>;
  return findByIn(ClasseModel, "_id", ids, proj, chunkSize);
}
export function findMissionAPIByIds(ids: string[], chunkSize: number) {
  // Jointure confirmée en Step 1 (défaut : MissionAPI._id == mission.apiEngagementId).
  const proj = { ...buildProjection(MODEL_FIELDS.missionAPI), _id: 1 } as Record<string, 1>;
  return findByIn(MissionAPIModel, "_id", ids, proj, chunkSize);
}
