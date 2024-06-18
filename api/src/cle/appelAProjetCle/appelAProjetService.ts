import { getClassesAndEtablissementsFromAppelAProjets } from "../../providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { IReferent } from "../../models/referentType";
import { IEtablissement } from "../../models/cle/etablissementType";
import { IClasse } from "../../models/cle/classeType";
import EtablissementModel from "../../models/cle/etablissement";
import { apiEducation } from "../../services/gouv.fr/api-education";
import { etablissementMapper } from "../etablissement/etablissementMapper";

export const syncAppelAProjet = async () => {
  const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();
  const referentsToCreate: IReferent[] = [];
  const referentsToLog: IReferent[] = [];
  const etablissementsToCreate: IEtablissement[] = [];
  const etablissementsToUpdate: IEtablissement[] = [];
  const etablissementsErrors: { id: string; uai?: string; error: string }[] = [];
  const classesToCreate: IClasse[] = [];
  const classesToUpdate: IClasse[] = [];

  const etablissements = await apiEducation({
    filters: [{ key: "uai", value: appelAProjets.map((appelAProjet) => getUAIfromAAP(appelAProjet)) }],
    page: 0,
    size: -1,
  });

  for (const appelAProjet of appelAProjets) {
    // if referent exists, update it
    // if not, create referent
    //---------------
    const uai = getUAIfromAAP(appelAProjet);
    if (!uai) {
      // @ts-ignore
      etablissementsErrors.push({ id: appelAProjet.id, error: "UAI not found" });
      continue;
    }

    if ([...etablissementsToCreate, ...etablissementsToUpdate].map((etablissement) => etablissement.uai).includes(uai)) {
      // @ts-ignore
      etablissementsErrors.push({ id: appelAProjet.id, uai, error: "Etablissement already processed" });
      continue;
    }

    const etablissement = etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);
    if (!etablissement) {
      // @ts-ignore
      etablissementsErrors.push({ id: appelAProjet.id, uai, error: "Etablissement not found" });
      continue;
    }

    const formattedEtablissement = etablissementMapper(etablissement, referentsToCreate);

    if (await EtablissementModel.exists({ uai })) {
      etablissementsToUpdate.push(formattedEtablissement);
    } else {
      etablissementsToCreate.push(formattedEtablissement);
    }
    //---------------
    // if classe exists, update it
    // if not, create classe
  }

  // TODO: csv export
  console.log("🚀 ~ syncAppelAProjet ~ etablissementsToUpdate:", etablissementsToUpdate);
  console.log("🚀 ~ syncAppelAProjet ~ etablissementsToCreate:", etablissementsToCreate);
  console.log("🚀 ~ syncAppelAProjet ~ etablissementsErrors:", etablissementsErrors);
  return appelAProjets;
};

// TODO: update or remove when appelAProjet mapping is done
function getUAIfromAAP(appelAProjet: any): string {
  const field = appelAProjet.champs.find((champ: { label: string; stringValue: string }) => champ.label === "Etablissement, Ville (UAI)");
  return field?.stringValue.split(" (")[1]?.replace(")", "");
}
