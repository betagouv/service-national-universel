import { ReferentModel, ReferentDocument } from "../../models";

export const getReferentsByIds = async (referentIds: string[]): Promise<ReferentDocument[]> => {
  const referents = await ReferentModel.find({ _id: { $in: referentIds } });

  // Les données ne sont pas suffisament propres pour faire cette vérification :(
  // Exemple: On a des coordinateurIds dans la collection `etablissement` qui ne
  // correspondent pas à des référents existants
  // if (referents.length !== referentIds.length) {
  //   const foundIds = referents.map((referent) => referent._id.toString());
  //   const missingIds = referentIds.filter((id) => !foundIds.includes(id));
  //   throw new Error(`Referents not found: ${missingIds.join(", ")}`);
  // }

  return referents;
};
