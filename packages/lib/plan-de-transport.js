const PDT_IMPORT_ERRORS = {
  BAD_TOTAL_CAPACITY: "BAD_TOTAL_CAPACITY",
  DOUBLON_BUSNUM: "DOUBLON_BUSNUM",
  BAD_CENTER_ID: "BAD_CENTER_ID",
  BAD_PDR_ID: "BAD_PDR_ID",
  BAD_PDR_DEPARTEMENT: "BAD_PDR_DEPARTEMENT",
  SAME_PDR_ON_LINE: "SAME_PDR_ON_LINE",
  LACKING_YOUNG_CAPACITY: "LACKING_YOUNG_CAPACITY",
  MISSING_DATA: "MISSING_DATA",
  BAD_FORMAT: "BAD_FORMAT",
  UNKNOWN_DEPARTMENT: "UNKNOWN_DEPARTMENT",
  UNKNOWN_TRANSPORT_TYPE: "UNKNOWN_TRANSPORT_TYPE",
  CENTER_WITHOUT_SESSION: "CENTER_WITHOUT_SESSION",
  MISSING_COLUMN: "MISSING_COLUMN",
};

const PDT_IMPORT_ERRORS_TRANSLATION = {
  BAD_TOTAL_CAPACITY: { text: "La capacité totale n'est pas bonne.", tooltip: "La capacité totale doit être la somme de la capacité volontaires et accompagnateurs." },
  DOUBLON_BUSNUM: { text: "Le numéro de ligne %s est en doublon.", tooltip: "Veuillez vérifier que chaque numéro de ligne n’apparait qu’une seule fois dans le fichier." },
  BAD_CENTER_ID: { text: "ID du centre %s non existant.", tooltip: "Les ID des centres sont transmis dans le schéma de répartition." },
  BAD_PDR_ID: { text: "ID du PDR %s non existant.", tooltip: "Les ID des PDR sont transmis dans le schéma de répartition." },
  BAD_PDR_DEPARTEMENT: { text: "Erreur sur le département du PDR %s.", tooltip: "Le département du fichier ne correspond pas au département du PDR en base de données." },
  SAME_PDR_ON_LINE: { text: "Un même PDR %s apparaît plusieurs fois sur la ligne.", tooltip: "Un PDR ne peut appraître qu'une seule fois sur une même ligne." },
  LACKING_YOUNG_CAPACITY: {
    text: "La somme de la capacité volontaires des lignes est inférieure à la somme des volontaires du schéma de répartition affecté dans le centre",
    tooltip: "Veuillez vérifier l'ensemble de ces lignes pour qu'elles répondent au schéma de répartition.",
  },
  MISSING_DATA: { text: "Information manquante", tooltip: "Veuillez renseigner ce champ." },
  BAD_FORMAT: { text: "Format invalide", tooltip: "Veuillez vérifier la donnée." },
  UNKNOWN_DEPARTMENT: { text: "Département inconnu : %s", tooltip: "Veuillez vérifier le code de ce département" },
  UNKNOWN_TRANSPORT_TYPE: { text: "Type de transport inconnu : %s", tooltip: "Le type de transport peut être : bus, train ou avion." },
  CENTER_WITHOUT_SESSION: { text: "Le centre %s n'a pas de session sur ce séjour", tooltip: "Demandez à un modérateur de créer la session sur le centre." },
  MISSING_COLUMN: { text: "Colonne manquante ou mal orthographiée", tooltip: "Veuillez vérifier que la colonne est présente / bien orthographiée dans le fichier." },
};

export { PDT_IMPORT_ERRORS, PDT_IMPORT_ERRORS_TRANSLATION };
