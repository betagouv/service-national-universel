import { CohesionCenterDocument, CohesionCenterModel } from "../models";

export const getCentersByIds = async (centerIds: string[]): Promise<CohesionCenterDocument[]> => {
  const centers = await CohesionCenterModel.find({ _id: { $in: centerIds } });

  if (centers.length !== centerIds.length) {
    const foundIds = centers.map((center) => center._id.toString());
    const missingIds = centerIds.filter((id) => !foundIds.includes(id));
    throw new Error(`Centers not found: ${missingIds.join(", ")}`);
  }

  return centers;
};
