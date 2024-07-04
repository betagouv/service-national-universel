import { IEtablissement } from "../../models/cle/etablissementType";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";
import { ClasseSchoolYear, CLE_SECTOR, CLE_TYPE } from "snu-lib";

export function mapEtablissementFromAnnuaireToEtablissement(etablissement: EtablissementProviderDto, referentIds: string[]): IEtablissement {
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
    type: [mapCodeNatureToType(etablissement.code_nature)],
    sector: [mapStatutToSector(etablissement.statut_public_prive)],
    academy: etablissement.libelle_academie,
    state: "inactive",
    schoolYears: [ClasseSchoolYear.YEAR_2024_2025],
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

const mapCodeNatureToType = (codeNature: number): string => {
  switch (codeNature) {
    case 320:
      return CLE_TYPE.PROFESSIONAL_HIGHSCHOOL;
    case 300:
      return CLE_TYPE.GENERAL_AND_TECHNOLOGICAL_HIGHSCHOOL;
    case 301:
      return CLE_TYPE.GENERAL_AND_TECHNOLOGICAL_HIGHSCHOOL;
    case 306:
      return CLE_TYPE.POLYVALENT_HIGHSCHOOL;
    case 302:
      return CLE_TYPE.GENERAL_HIGHSCHOOL;
    case 307:
      return CLE_TYPE.AGRICULTURAL_HIGHSCHOOL;
    default:
      return CLE_TYPE.OTHER;
  }
};
