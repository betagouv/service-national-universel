import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";
import { ClasseSchoolYear, CLE_SECTOR, CLE_TYPE, EtablissementType } from "snu-lib";
import { capture } from "../../sentry";

export function mapEtablissementFromAnnuaireToEtablissement(
  etablissement: EtablissementProviderDto,
  referentIds: string[],
): Omit<EtablissementType, "coordinateurIds" | "updatedAt" | "createdAt" | "_id"> {
  return {
    uai: etablissement.identifiant_de_l_etablissement,
    name: etablissement.nom_etablissement,
    referentEtablissementIds: referentIds,
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
      capture(new Error("Unknown statut"));
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
