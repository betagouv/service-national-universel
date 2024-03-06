const PDT_IMPORT_ERRORS = {
  BAD_TOTAL_CAPACITY: "BAD_TOTAL_CAPACITY",
  DOUBLON_BUSNUM: "DOUBLON_BUSNUM",
  DOUBLON_CLASSE: "DOUBLON_CLASSE",
  BAD_CENTER_ID: "BAD_CENTER_ID",
  BAD_CLASSE_ID: "BAD_CLASSE_ID",
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
  DOUBLON_CLASSE: { text: "Le numéro de classe %s est en doublon.", tooltip: "Une classe ne peut être divisé sur plusieurs lignes." },
  BAD_CENTER_ID: { text: "ID du centre %s non existant.", tooltip: "Les ID des centres sont transmis dans le schéma de répartition." },
  BAD_CLASSE_ID: { text: "ID de classe %s non existant.", tooltip: "Les ID des classes sont transmis dans le schéma de répartition." },
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

const centersInJulyClosingEarly = [
  {
    _id: {
      $oid: "609bebb10c1cc9a888ae8fba",
    },
    code: "SNU844210",
    code2022: "ARALYO04203",
  },
  {
    _id: {
      $oid: "609bebb20c1cc9a888ae8fc2",
    },
    code: "SNU846313",
    code2022: "ARACLE06301",
  },
  {
    _id: {
      $oid: "609bebc60c1cc9a888ae909b",
    },
    code: "SNU761102",
    code2022: "OCCMON01101",
  },
  {
    _id: {
      $oid: "609bebca0c1cc9a888ae90c7",
    },
    code: "SNU524401",
    code2022: "PDLNAN04401",
  },
  {
    _id: {
      $oid: "60a7dd5aa9f80b075f068cea",
    },
    code: "SNU117511",
    code2022: "IDFPAR07501",
  },
  {
    _id: {
      $oid: "626b07616f7eb607e9b88b90",
    },
    code2022: "ARAGRE03802",
  },
  {
    _id: {
      $oid: "63c553786a71d408cb817985",
    },
    code2022: "GENAM08804",
  },
  {
    _id: {
      $oid: "63da4af647841408c5940c78",
    },
    code2022: "PACNIC00601",
  },
  {
    _id: {
      $oid: "63dff1eeca0dad08c4d81261",
    },
    code2022: "ARAGRE03805",
  },
  // pour test en staging
  {
    _id: {
      $oid: "63873264a4ec702331abec5f",
    },
    code2022: "ARAGRE03805",
  },
];

export { PDT_IMPORT_ERRORS, PDT_IMPORT_ERRORS_TRANSLATION, centersInJulyClosingEarly };
