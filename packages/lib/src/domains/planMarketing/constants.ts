export enum CampagneJeuneType {
  VOLONTAIRE = "VOLONTAIRE",
  CLE = "CLE",
  BOTH = "BOTH",
}
export enum DestinataireListeDiffusion {
  JEUNES = "JEUNES",
  REFERENTS_CLASSES = "REFERENTS_CLASSES",
  CHEFS_ETABLISSEMENT = "CHEFS_ETABLISSEMENT",
  REPRESENTANTS_LEGAUX = "REPRESENTANTS_LEGAUX",
  CHEFS_CENTRES = "CHEFS_CENTRES",
  COORDINATEURS_CLE = "COORDINATEURS_CLE",
}

export enum ListeDiffusionEnum {
  VOLONTAIRES = "Volontaires",
  INSCRIPTIONS = "Inscriptions",
}

export interface ListeDiffusionFiltres {
  [key: string]: string[];
}
