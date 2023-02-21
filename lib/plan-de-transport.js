
const PDT_CELL_FORMAT = {
  string: "string",
  date: "date",
  department: "department",
  objectId: "objectId",
  transportType: "transportType",
  hour: "hour",
  integer: "integer",
  boolean: "boolean",
};

const PDT_COLUMNS_BUS = [
  { id: "NUM_LINE", format: PDT_CELL_FORMAT.string, name: "Numéro de ligne" },
  { id: "ALLER_DATE", format: PDT_CELL_FORMAT.date, name: "Date de transport Aller" },
  { id: "RETOUR_DATE", format: PDT_CELL_FORMAT.date, name: "Date de transport Retour" },
];
const PDT_COLUMNS_PDR = [
  { id: "PDR_DEPARTEMENT", format: PDT_CELL_FORMAT.department, name: "Numéro de département du PDR %n" },
  { id: "PDR_ID", format: PDT_CELL_FORMAT.objectId, name: "ID du PDR %n" },
  { id: "PDR_TYPE", format: PDT_CELL_FORMAT.transportType, name: "Type de transport PDR %n" },
  { id: "PDR_NOM", format: PDT_CELL_FORMAT.string, name: "Nom + Adresse du PDR %n" },
  { id: "PDR_ALLER_ARRIVEE", format: PDT_CELL_FORMAT.hour, name: "Heure Aller arrivée au PDR %n" },
  { id: "PDR_ALLER_DEPART", format: PDT_CELL_FORMAT.hour, name: "Heure Aller départ du PDR %n" },
  { id: "PDR_RETOUR_ARRIVEE", format: PDT_CELL_FORMAT.hour, name: "Heure Retour arrivée au PDR %n" },
];
const PDT_COLUMNS_CENTER = [
  { id: "CENTRE_DEPARTEMENT", format: PDT_CELL_FORMAT.department, name: "Numéro de département du Centre" },
  { id: "CENTRE_ID", format: PDT_CELL_FORMAT.objectId, name: "ID du centre" },
  { id: "CENTRE_NOM", format: PDT_CELL_FORMAT.string, name: "Nom + Adresse du centre" },
  { id: "CENTRE_ARRIVEE", format: PDT_CELL_FORMAT.hour, name: "Heure d'arrivée au centre" },
  { id: "CENTRE_DEPART", format: PDT_CELL_FORMAT.hour, name: "Heure de départ du centre" },
  { id: "CAPACITE_ACCOMPAGNATEURS", format: PDT_CELL_FORMAT.integer, name: "Total accompagnateurs" },
  { id: "CAPACITE_VOLONTAIRES", format: PDT_CELL_FORMAT.integer, name: "Capacité volontaire totale" },
  { id: "CAPACITE_TOTALE", format: PDT_CELL_FORMAT.integer, name: "Capacité totale ligne" },
  { id: "ALLER_PAUSE", format: PDT_CELL_FORMAT.boolean, name: "Pause déjeuner aller" },
  { id: "RETOUR_PAUSE", format: PDT_CELL_FORMAT.boolean, name: "Pause déjeuner retour" },
  { id: "KM", format: PDT_CELL_FORMAT.integer, name: "Temps de trajet" },
];

const PDT_IMPORT_ERRORS = {
  BAD_TOTAL_CAPACITY: "BAD_TOTAL_CAPACITY",
  DOUBLON_BUSNUM: "DOUBLON_BUSNUM",
  BAD_CENTER_ID: "BAD_CENTER_ID",
  BAD_PDR_ID: "BAD_PDR_ID",
  SAME_PDR_ON_LINE: "SAME_PDR_ON_LINE",
  LACKING_YOUNG_CAPACITY: "LACKING_YOUNG_CAPACITY",
  MISSING_DATA: "MISSING_DATA",
  BAD_FORMAT: "BAD_FORMAT",
  UNKNOWN_DEPARTMENT: "UNKNOWN_DEPARTMENT",
  UNKNOWN_TRANSPORT_TYPE: "UNKNOWN_TRANSPORT_TYPE",
  UNKNOWN_COLUM_TYPE: "UNKNOWN_COLUM_TYPE",
};

const PDT_IMPORT_ERRORS_TRANSLATION = {
  BAD_TOTAL_CAPACITY: { text: "La capacité totale n'est pas bonne.", tooltip: "La capacité totale doit être la somme de la capacité volontaires et accompagnateurs."},
  DOUBLON_BUSNUM: { text: "Le numéro de ligne %s est en doublon.", tooltip: "Veuillez vérifier que que chaque numéro de ligne n’apparait qu’une seule fois dans le fichier."},
  BAD_CENTER_ID: { text: "ID du centre %s non existant.", tooltip: "Les ID des centres sont transmis dans le schéma de répartition."},
  BAD_PDR_ID: { text: "ID du PDR %s non existant.", tooltip: "Les ID des PDR sont transmis dans le schéma de répartition."},
  SAME_PDR_ON_LINE: { text: "Un même PDR %s apparaît plusieurs fois sur la ligne.", tooltip: "Un PDR ne peut appraître qu'une seule fois sur une même ligne."},
  LACKING_YOUNG_CAPACITY: { text: "la somme de la capacité volontaires des lignes est inférieure à la somme des volontaires du schéma de répartition affecté dans le centre", tooltip: "Veuillez vérifier l'ensemble de ces lignes pour qu'elles répondent au schéma de répartition."},
  MISSING_DATA: { text: "Information manquante", tooltip: "Veuillez renseigner ce champs."},
  BAD_FORMAT: { text: "Format invalide", tooltip: "Veuillez vérifier la donnée."},
  UNKNOWN_DEPARTMENT: { text: "Département inconnu : %s", tooltip: "Veuillez vérifier le code de ce département"},
  UNKNOWN_TRANSPORT_TYPE: { text: "Type de transport inconnu : %s", tooltip: "Le type de transport peut être : bus, train ou avion."},
  UNKNOWN_COLUM_TYPE: { text: "Erreur interne : type de colonne inconnue", tooltip: "Veuillez contacter le support si ce problème persiste."},
};

module.exports = {
  PDT_CELL_FORMAT,
  PDT_COLUMNS_BUS,
  PDT_COLUMNS_PDR,
  PDT_COLUMNS_CENTER,
  PDT_IMPORT_ERRORS,
  PDT_IMPORT_ERRORS_TRANSLATION,
};
