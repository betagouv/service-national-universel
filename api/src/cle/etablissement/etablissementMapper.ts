import { IEtablissement } from "../../models/cle/etablissementType";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";

export function etablissementMapper(etablissement: EtablissementProviderDto, referentIds: string[]): IEtablissement {
  return {
    uai: etablissement.identifiant_de_l_etablissement,
    name: etablissement.nom_etablissement,
    referentEtablissementIds: referentIds,
    coordinateurIds: [],
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
