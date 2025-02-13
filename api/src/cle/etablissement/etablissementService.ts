import { EtablissementDocument, EtablissementModel } from "../../models";

export const getEtablissementsByIds = async (etablissementIds: string[]): Promise<EtablissementDocument[]> => {
  const etablissements = await EtablissementModel.find({ _id: { $in: etablissementIds } });

  if (etablissements.length !== etablissementIds.length) {
    const foundIds = etablissements.map((etablissement) => etablissement._id.toString());
    const missingIds = etablissementIds.filter((id) => !foundIds.includes(id));
    throw new Error(`Etablissements not found: ${missingIds.join(", ")}`);
  }

  return etablissements;
};
