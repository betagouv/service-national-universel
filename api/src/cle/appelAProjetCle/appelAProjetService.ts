import { getClassesAndEtablissementsFromAppelAProjets } from "@/providers/demarcheSimplifieeProvider";
import { IReferent } from "@/models/referentType";
import { IEtablissement } from "@/models/cle/etablissementType";
import { IClasse } from "@/models/cle/classeType";

export const syncAppelAProjet = async () => {
  const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();

  const referentsToCreate: IReferent[] = [];
  const etablissementsToCreate: IEtablissement[] = [];
  const classesToCreate: IClasse[] = [];
  for (const appelAProjet of appelAProjets) {
    // if referent exists, update it
    // if not, create referent
    //---------------
    // get complemenary data from api-education
    // if etablissement exists, update it
    // if not, create etablissement
    //---------------
    // if classe exists, update it
    // if not, create classe
  }
};
