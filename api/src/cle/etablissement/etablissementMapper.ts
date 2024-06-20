import { IEtablissement } from "../../models/cle/etablissementType";
import { IReferent } from "../../models/referentType";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";
import { SUB_ROLES } from "snu-lib";

export function etablissementMapper(etablissement: EtablissementProviderDto, referents: IReferent[]): IEtablissement {
  return {
    uai: etablissement.identifiant_de_l_etablissement,
    name: etablissement.nom_etablissement,
    referentEtablissementIds: referents.filter((user) => user.subRole === SUB_ROLES.referent_etablissement).map((user) => user.id),
    coordinateurIds: referents.filter((user) => user.subRole === SUB_ROLES.coordinateur_cle).map((user) => user.id),
    department: etablissement.libelle_departement,
    region: etablissement.libelle_region,
    zip: etablissement.code_postal,
    city: etablissement.nom_commune,
    address: etablissement.adresse_1,
    country: "France",
    // TODO: map type and sector to our enums
    type: [etablissement.type_etablissement],
    sector: [etablissement.statut_public_prive],
    academy: etablissement.libelle_academie,
    state: "inactive",
    schoolYears: [],
  };
}
