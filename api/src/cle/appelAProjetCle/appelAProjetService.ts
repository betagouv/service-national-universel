import { getClassesAndEtablissementsFromAppelAProjets } from "@/providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { IReferent } from "@/models/referentType";
import { IEtablissement } from "@/models/cle/etablissementType";
import { IClasse } from "@/models/cle/classeType";

export const syncAppelAProjet = async () => {
  const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();
  console.log("appelAProjets", appelAProjets);
  const referentsToCreate: IReferent[] = [];
  const referentsToLog: IReferent[] = [];
  const etablissementsToCreate: IEtablissement[] = [];
  const etablissementsToUpdate: IEtablissement[] = [];
  const classesToCreate: IClasse[] = [];
  const classesToUpdate: IClasse[] = [];
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
  return appelAProjets;
};
