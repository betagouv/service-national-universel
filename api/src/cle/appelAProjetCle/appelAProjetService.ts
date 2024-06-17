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
  for (const appelAProjet of appelAProjets) {
    // if referent exists, update it
    // if not, create referent
    //---------------
    const etablissementField = appelAProjet.champs.find((champ) => champ.label === "Etablissement, Ville (UAI)");
    const uai = etablissementField?.stringValue.split(" (")[1]?.replace(")", "");
    const etablissements = await apiEducation({ filters: [{ uai }], page: 1, size: 1 });
    const etablissement = etablissements.results[0];
    if (!etablissement) {
      console.error("Etablissement not found", uai);
      continue;
    }

    const formattedEtablissement = {
      uai,
      name: etablissement.nom_etablissement,
      referentEtablissementIds: referentsToLog.filter((referent) => referent.subRole === SUB_ROLES.referent_etablissement).map((referent) => referent.id),
      coordinateurIds: referentsToLog.filter((referent) => referent.subRole === SUB_ROLES.coordinateur_cle).map((referent) => referent.id),
      department: etablissement.libelle_departement,
      region: etablissement.libelle_region,
      zip: etablissement.code_postal,
      city: etablissement.nom_commune,
      address: etablissement.adresse_1,
      country: "France",
      // TODO: map type and sector to our enums
      type: etablissement.type_etablissement,
      sector: etablissement.statut_public_prive,
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
  return appelAProjets;
};
