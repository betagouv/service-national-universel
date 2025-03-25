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
    case "Nouvelle-Calédonie":
      return "NCA";
    case "Polynésie française":
      return "POL";
    case "Wallis-et-Futuna":
      return "WAL";
    case "Saint-Pierre-et-Miquelon":
      return "SPM";
    case "Terres australes et antarctiques françaises":
      return "TAA";
    default:
      logger.warn(`mapRegionToTrigramme() - No matching region for : ${region}`);
      return undefined;
  }
};

export const mapTrigrammeToRegion = (region: string | undefined): string | undefined => {
  switch (region) {
    case "ARA":
      return "Auvergne-Rhône-Alpes";
    case "BFC":
      return "Bourgogne-Franche-Comté";
    case "BRE":
      return "Bretagne";
    case "CVL":
      return "Centre-Val de Loire";
    case "COR":
      return "Corse";
    case "GES":
      return "Grand Est";
    case "GUA":
      return "Guadeloupe";
    case "GUY":
      return "Guyane";
    case "HDF":
      return "Hauts-de-France";
    case "IDF":
      return "Île-de-France";
    case "REU":
      return "La Réunion";
    case "MAR":
      return "Martinique";
    case "MAY":
      return "Mayotte";
    case "NOR":
      return "Normandie";
    case "NAQ":
      return "Nouvelle-Aquitaine";
    case "OCC":
      return "Occitanie";
    case "PDL":
      return "Pays de la Loire";
    case "PAC":
      return "Provence-Alpes-Côte d'Azur";
    case "NCA":
      return "Nouvelle-Calédonie";
    case "POL":
      return "Polynésie française";
    case "WAL":
      return "Wallis-et-Futuna";
    case "SPM":
      return "Saint-Pierre-et-Miquelon";
    case "TAA":
      return "Terres australes et antarctiques françaises";
    default:
      logger.warn(`mapRegionToTrigramme() - No matching region for : ${region}`);
      return undefined;
  }
};
