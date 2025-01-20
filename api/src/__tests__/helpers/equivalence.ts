import { MissionEquivalenceModel } from "../../models";

export async function createMissionEquivalenceHelpers(mission: any): Promise<any> {
  return await MissionEquivalenceModel.create(mission);
}

export const notExistingMissionEquivalenceId = "104a49ba503040e4d2153978";
