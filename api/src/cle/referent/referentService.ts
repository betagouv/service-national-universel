import { ReferentModel, ReferentDocument } from "../../models";

export const getReferentsByIds = async (referentIds: string[]): Promise<ReferentDocument[]> => {
  const referents = await ReferentModel.find({ _id: { $in: referentIds } });

  if (referents.length !== referentIds.length) {
    const foundIds = referents.map((referent) => referent._id.toString());
    const missingIds = referentIds.filter((id) => !foundIds.includes(id));
    throw new Error(`Referents not found: ${missingIds.join(", ")}`);
  }

  return referents;
};
