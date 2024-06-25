import { IEtablissement } from "../../models/cle/etablissementType";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";
import { CLE_SECTOR, CLE_TYPE } from "snu-lib";

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
    type: [CLE_TYPE.OTHER],
    sector: [mapStatutToSector(etablissement.statut_public_prive)],
    academy: etablissement.libelle_academie,
    state: "inactive",
    schoolYears: [],
  };
}

const mapStatutToSector = (statut: string): string => {
  switch (statut) {
    case "Public":
      return CLE_SECTOR.PUBLIC;
    case "Priv\u00e9":
      return CLE_SECTOR.PRIVATE;
    default:
      console.error(`Unknown statut: ${statut}`);
      return "";
  }
};
