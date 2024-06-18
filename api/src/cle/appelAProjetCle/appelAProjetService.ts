import { getClassesAndEtablissementsFromAppelAProjets } from "../../providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { IReferent } from "../../models/referentType";
import { IEtablissement } from "../../models/cle/etablissementType";
import { IClasse } from "../../models/cle/classeType";
import EtablissementModel from "../../models/cle/etablissement";
import { apiEducation } from "../../services/gouv.fr/api-education";
import { SUB_ROLES } from "snu-lib";

export const syncAppelAProjet = async () => {
  const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();
  const referentsToCreate: IReferent[] = [];
  const referentsToLog: IReferent[] = [];
  const etablissementsToCreate: IEtablissement[] = [];
  const etablissementsToUpdate: IEtablissement[] = [];
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
      console.error("UAI not found", appelAProjet.id);
      continue;
    }

    const etablissement = etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);
    if (!etablissement) {
      console.error("Etablissement not found", uai);
      continue;
    }

    const formattedEtablissement = {
      uai,
      name: etablissement.nom_etablissement,
      referentEtablissementIds: referentsToLog.filter((user) => user.subRole === SUB_ROLES.referent_etablissement).map((user) => user.id),
      coordinateurIds: referentsToLog.filter((user) => user.subRole === SUB_ROLES.coordinateur_cle).map((user) => user.id),
      department: etablissement.libelle_departement,
      region: etablissement.libelle_region,
      zip: etablissement.code_postal,
      city: etablissement.nom_commune,
      address: etablissement.adresse_1,
      country: "France",
      // TODO: map type and sector to our enums
      type: [etablissement.type_etablissement],
      sector: [etablissement.statut_public_prive],
    };

    if (await EtablissementModel.exists({ uai })) {
      etablissementsToUpdate.push(formattedEtablissement);
    } else {
      etablissementsToCreate.push(formattedEtablissement);
    }
    //---------------
    // if classe exists, update it
    // if not, create classe
  }

  console.log("🚀 ~ syncAppelAProjet ~ etablissementsToUpdate:", etablissementsToUpdate);
  console.log("🚀 ~ syncAppelAProjet ~ etablissementsToCreate:", etablissementsToCreate);
  return appelAProjets;
};

// TODO: update or remove when appelAProjet mapping is done
function getUAIfromAAP(appelAProjet: any): string {
  const field = appelAProjet.champs.find((champ: { label: string; stringValue: string }) => champ.label === "Etablissement, Ville (UAI)");
  return field?.stringValue.split(" (")[1]?.replace(")", "");
}
