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

export enum TypeEvenement {
  DATE_DEBUT_SEJOUR = "DATE_DEBUT_SEJOUR",
  DATE_FIN_SEJOUR = "DATE_FIN_SEJOUR",
  DATE_OUVERTURE_INSCRIPTIONS = "DATE_OUVERTURE_INSCRIPTIONS",
  DATE_FERMETURE_INSCRIPTIONS = "DATE_FERMETURE_INSCRIPTIONS",
  DATE_FERMETURE_MODIFICATIONS = "DATE_FERMETURE_MODIFICATIONS",
  DATE_FERMETURE_INSTRUCTIONS = "DATE_FERMETURE_INSTRUCTIONS",
  DATE_VALIDATION_PHASE1 = "DATE_VALIDATION_PHASE1",
  ENVOI_PRECEDENT = "ENVOI_PRECEDENT",
  AUCUN = "AUCUN"
}

export enum TypeRegleEnvoi {
  DATE = "DATE",
  ACTION = "ACTION",
  PERSONNALISE = "PERSONNALISE"
}

export const REGLE_ENVOI_CONFIG = {
  [TypeRegleEnvoi.DATE]: {
    joursMin: -30,
    joursMax: 30,
    requiertDateHeure: true
  },
  [TypeRegleEnvoi.ACTION]: {
    joursMin: 0,
    joursMax: 30,
    requiertDateHeure: false
  },
  [TypeRegleEnvoi.PERSONNALISE]: {
    joursMin: null,
    joursMax: null,
    requiertDateHeure: true
  }
} as const;

export const TYPE_EVENEMENT_LABELS = {
  [TypeEvenement.DATE_DEBUT_SEJOUR]: "Date de début du séjour",
  [TypeEvenement.DATE_FIN_SEJOUR]: "Date de fin du séjour",
  [TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS]: "Date d'ouverture des inscriptions",
  [TypeEvenement.DATE_FERMETURE_INSCRIPTIONS]: "Date de fermeture des inscriptions",
  [TypeEvenement.DATE_FERMETURE_MODIFICATIONS]: "Date de fermeture des modifications sur le dossier d'un volontaire",
  [TypeEvenement.DATE_FERMETURE_INSTRUCTIONS]: "Date de fermeture des instructions",
  [TypeEvenement.DATE_VALIDATION_PHASE1]: "Date de validation de la phase 1 des volontaires",
  [TypeEvenement.ENVOI_PRECEDENT]: "Envoi précédent",
  [TypeEvenement.AUCUN]: "Aucun"
} as const;

// Définition des types d'événements par catégorie
export const EVENEMENT_TYPE_MAP: Record<TypeEvenement, TypeRegleEnvoi> = {
  [TypeEvenement.DATE_DEBUT_SEJOUR]: TypeRegleEnvoi.DATE,
  [TypeEvenement.DATE_FIN_SEJOUR]: TypeRegleEnvoi.DATE,
  [TypeEvenement.DATE_OUVERTURE_INSCRIPTIONS]: TypeRegleEnvoi.DATE,
  [TypeEvenement.DATE_FERMETURE_INSCRIPTIONS]: TypeRegleEnvoi.DATE,
  [TypeEvenement.DATE_FERMETURE_MODIFICATIONS]: TypeRegleEnvoi.DATE,
  [TypeEvenement.DATE_FERMETURE_INSTRUCTIONS]: TypeRegleEnvoi.DATE,
  [TypeEvenement.DATE_VALIDATION_PHASE1]: TypeRegleEnvoi.DATE,
  [TypeEvenement.ENVOI_PRECEDENT]: TypeRegleEnvoi.ACTION,
  [TypeEvenement.AUCUN]: TypeRegleEnvoi.PERSONNALISE
} as const;

