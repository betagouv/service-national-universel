import { ReferentModel, ReferentDocument } from "../../models";
import { REFERENT_CLE_PUBLIC_FIELDS } from "../referentProjection";

/**
 * Projection explicite : sans elle, la route renvoie les documents référents bruts, jetons
 * d'invitation, de réinitialisation de mot de passe et 2FA compris.
 */
export const getReferentsByIds = async (referentIds: string[]): Promise<ReferentDocument[]> => {
  const referents = await ReferentModel.find({ _id: { $in: referentIds } }).select(REFERENT_CLE_PUBLIC_FIELDS);

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
