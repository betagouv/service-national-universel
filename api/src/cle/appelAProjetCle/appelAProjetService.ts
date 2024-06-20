import { getClassesAndEtablissementsFromAppelAProjets } from "../../providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { IReferent } from "../../models/referentType";
import { IEtablissement } from "../../models/cle/etablissementType";
import { IClasse } from "../../models/cle/classeType";
import { CleEtablissementModel } from "../../models";
import { apiEducation } from "../../services/gouv.fr/api-education";
import { etablissementMapper } from "../etablissement/etablissementMapper";

export const syncAppelAProjet = async (schoolYear: string) => {
  const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();
  const referentsToCreate: IReferent[] = [];
  const referentsToLog: IReferent[] = [];
  const etablissementsToCreate: IEtablissement[] = [];
  const etablissementsToUpdate: IEtablissement[] = [];
  const etablissementsErrors: { error: string; uai?: string | null; email?: string | null }[] = [];
  const classesToCreate: IClasse[] = [];
  const classesToUpdate: IClasse[] = [];

  const uais = [...new Set(appelAProjets.map((AAP) => AAP.etablissement?.uai).filter(Boolean))];

  const etablissements = await apiEducation({
    filters: [{ key: "uai", value: uais }],
    page: 0,
    size: -1,
  });

  for (const appelAProjet of appelAProjets) {
    // if referent exists, update it
    // if not, create referent
    //---------------
    const uai = appelAProjet.etablissement?.uai;
    if (!uai) {
      etablissementsErrors.push({
        error: "No UAI provided",
        uai: null,
        email: appelAProjet.etablissement.email,
      });
      continue;
    }

    if ([...etablissementsToCreate, ...etablissementsToUpdate].map((etablissement) => etablissement.uai).includes(uai)) {
      etablissementsErrors.push({
        error: "UAI already processed",
        uai: appelAProjet.etablissement.uai,
        email: appelAProjet.etablissement.email,
      });
      continue;
    }

    const etablissement = etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);

    if (!etablissement) {
      etablissementsErrors.push({
        error: "Etablissement not found",
        uai: appelAProjet.etablissement.uai,
        email: appelAProjet.etablissement.email,
      });
      continue;
    }

    const formattedEtablissement = etablissementMapper(etablissement, referentsToCreate);

    const currentEtablissement = await CleEtablissementModel.findOne({ uai });

    if (currentEtablissement) {
      formattedEtablissement.schoolYears = [...currentEtablissement.schoolYears, schoolYear];
      etablissementsToUpdate.push(formattedEtablissement);
    } else {
      formattedEtablissement.schoolYears = [schoolYear];
      etablissementsToCreate.push(formattedEtablissement);
    }
    //---------------
    // if classe exists, update it
    // if not, create classe
  }

  // TODO: csv export
  console.log("🚀 ~ syncAppelAProjet ~ etablissementsToUpdate:", etablissementsToUpdate.length);
  console.log("🚀 ~ syncAppelAProjet ~ etablissementsToCreate:", etablissementsToCreate.length);
  console.log("🚀 ~ syncAppelAProjet ~ etablissementsErrors:", etablissementsErrors.length);
  return appelAProjets;
};
