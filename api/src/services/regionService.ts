const { logger } = require("../logger");

export const mapRegionToTrigramme = (region: string | undefined): string | undefined => {
  switch (region) {
    case "Auvergne-Rhône-Alpes":
      return "ARA";
    case "Bourgogne-Franche-Comté":
      return "BFC";
    case "Bretagne":
      return "BRE";
    case "Centre-Val de Loire":
      return "CVL";
    case "Corse":
      return "COR";
    case "Grand Est":
      return "GES";
    case "Guadeloupe":
      return "GUA";
    case "Guyane":
      return "GUY";
    case "Hauts-de-France":
      return "HDF";
    case "Île-de-France":
    case "Ile-de-France":
      return "IDF";
    case "La Réunion":
      return "REU";
    case "Martinique":
      return "MAR";
    case "Mayotte":
      return "MAY";
    case "Normandie":
      return "NOR";
    case "Nouvelle-Aquitaine":
      return "NAQ";
    case "Occitanie":
      return "OCC";
    case "Pays de la Loire":
      return "PDL";
    case "Provence-Alpes-Côte d'Azur":
      return "PAC";
    default:
      logger.warn(`mapRegionToTrigramme() - No matching region for : ${region}`);
      return undefined;
  }
};
