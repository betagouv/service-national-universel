import passwordValidator from "password-validator";

export const formatStringDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

export const translate = (value) => {
  switch (value) {
    case "IN_COMING":
      return "À venir";
    case "WAITING_AFFECTATION":
      return "En attente d'affectation";
    case "WAITING_VALIDATION":
      return "En attente de validation";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "IN_PROGRESS":
      return "En cours";
    case "VALIDATED":
      return "Validée";
    case "CONTINUOUS":
      return "Mission perlée (84 heures tout au long de l'année)";
    case "DISCONTINUOUS":
      return "Mission continue (12 jours d'affilée sauf exception)";
    case "DRAFT":
      return "Brouillon";
    case "REFUSED":
      return "Refusée";
    case "CANCEL":
      return "Annulée";
    case "DONE":
      return "Effectuée";
    case "ARCHIVED":
      return "Archivée";
    case "ASSOCIATION":
      return "Association";
    case "PUBLIC":
      return "Structure publique";
    case "PRIVATE":
      return "Structure privée";
    case "OTHER":
      return "Autre";
    case "GENERAL_SCHOOL":
      return "En enseignement général ou technologique";
    case "PROFESSIONAL_SCHOOL":
      return "En enseignement professionnel";
    case "AGRICULTURAL_SCHOOL":
      return "En lycée agricole";
    case "SPECIALIZED_SCHOOL":
      return "En établissement spécialisé";
    case "APPRENTICESHIP":
      return "En apprentissage";
    case "EMPLOYEE":
      return "Salarié(e)";
    case "INDEPENDANT":
      return "Indépendant(e)";
    case "SELF_EMPLOYED":
      return "Auto-entrepreneur";
    case "ADAPTED_COMPANY":
      return "En ESAT, CAT ou en entreprise adaptée";
    case "POLE_EMPLOI":
      return "Inscrit(e) à Pôle emploi";
    case "MISSION_LOCALE":
      return "Inscrit(e) à la Mission locale";
    case "CAP_EMPLOI":
      return "Inscrit(e) à Cap emploi";
    case "NOTHING":
      return "Inscrit(e) nulle part";
    case "admin":
      return "modérateur";
    case "referent_department":
      return "Référent départemental";
    case "referent_region":
      return "Référent régional";
    case "COHESION_STAY":
      return "Séjour de cohésion";
    case "INSCRIPTION":
      return "Inscription";
    case "SUMMER":
      return "Vacances d'été (juillet ou août)";
    case "AUTUMN":
      return "Vacances d'automne";
    case "DECEMBER":
      return "Vacances de fin d'année (décembre)";
    case "WINTER":
      return "Vacances d'hiver";
    case "SPRING":
      return "Vacances de printemps";
    case "EVENING":
      return "En soirée";
    case "END_DAY":
      return "En fin de journée";
    case "WEEKEND":
      return "Durant le week-end";
    case "CITIZENSHIP":
      return "Citoyenneté";
    case "CULTURE":
      return "Culture";
    case "DEFENSE":
      return "Défense et mémoire";
    case "EDUCATION":
      return "Éducation";
    case "ENVIRONMENT":
      return "Environnement";
    case "HEALTH":
      return "Santé";
    case "SECURITY":
      return "Sécurité";
    case "SOLIDARITY":
      return "Solidarité";
    case "SPORT":
      return "Sport";
    case "UNIFORM":
      return "Corps en uniforme";
    case "OTHER":
      return "Autre";
    case "UNKNOWN":
      return "Non connu pour le moment";
    case "FIREFIGHTER":
      return "Pompiers";
    case "POLICE":
      return "Police";
    case "ARMY":
      return "Militaire";
    case "DURING_HOLIDAYS":
      return "Sur les vacances scolaires";
    case "DURING_SCHOOL":
      return "Sur le temps scolaire";
    case "true":
      return "Oui";
    case "false":
      return "Non";
    case "male":
      return "Homme";
    case "female":
      return "Femme";
    case "father":
      return "Père";
    case "mother":
      return "Mère";
    case "representant":
      return "Représentant légal";
    case "SERVER_ERROR":
      return "Erreur serveur";
    case "NOT_FOUND":
      return "Ressource introuvable";
    case "PASSWORD_TOKEN_EXPIRED_OR_INVALID":
      return "Lien expiré ou token invalide";
    case "USER_ALREADY_REGISTERED":
      return "Utilisateur déjà inscrit";
    case "PASSWORD_NOT_VALIDATED":
      return "Mot de passe invalide";
    case "INVITATION_TOKEN_EXPIRED_OR_INVALID":
      return "Invitation invalide";
    case "USER_NOT_FOUND":
    case "USER_NOT_EXISTS":
      return "L'utilisateur n'existe pas";
    case "OPERATION_UNAUTHORIZED":
      return "Opération non autorisée";
    case "FILE_CORRUPTED":
      return "Ce fichier est corrompu";
    case "YOUNG_ALREADY_REGISTERED":
      return "Utilisateur déjà inscrit";
    default:
      return value;
  }
};

export const departmentLookUp = {
  "01": "Ain",
  "02": "Aisne",
  "03": "Allier",
  "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes",
  "06": "Alpes-Maritimes",
  "07": "Ardèche",
  "08": "Ardennes",
  "09": "Ariège",
  10: "Aube",
  11: "Aude",
  12: "Aveyron",
  13: "Bouches-du-Rhône",
  14: "Calvados",
  15: "Cantal",
  16: "Charente",
  17: "Charente-Maritime",
  18: "Cher",
  19: "Corrèze",
  20: "Corse",
  21: "Côte-d'Or",
  22: "Côtes-d'Armor",
  23: "Creuse",
  24: "Dordogne",
  25: "Doubs",
  26: "Drôme",
  27: "Eure",
  28: "Eure-et-Loire",
  29: "Finistère",
  "2A": "Corse-du-Sud",
  "2B": "Haute-Corse",
  30: "Gard",
  31: "Haute-Garonne",
  32: "Gers",
  33: "Gironde",
  34: "Hérault",
  35: "Ille-et-Vilaine",
  36: "Indre",
  37: "Indre-et-Loire",
  38: "Isère",
  39: "Jura",
  40: "Landes",
  41: "Loir-et-Cher",
  42: "Loire",
  43: "Haute-Loire",
  44: "Loire-Atlantique",
  45: "Loiret",
  46: "Lot",
  47: "Lot-et-Garonne",
  48: "Lozère",
  49: "Maine-et-Loire",
  50: "Manche",
  51: "Marne",
  52: "Haute-Marne",
  53: "Mayenne",
  54: "Meurthe-et-Moselle",
  55: "Meuse",
  56: "Morbihan",
  57: "Moselle",
  58: "Nièvre",
  59: "Nord",
  60: "Oise",
  61: "Orne",
  62: "Pas-de-Calais",
  63: "Puy-de-Dôme",
  64: "Pyrénées-Atlantiques",
  65: "Hautes-Pyrénées",
  66: "Pyrénées-Orientales",
  67: "Bas-Rhin",
  68: "Haut-Rhin",
  69: "Rhône",
  70: "Haute-Saône",
  71: "Saône-et-Loire",
  72: "Sarthe",
  73: "Savoie",
  74: "Haute-Savoie",
  75: "Paris",
  76: "Seine-Maritime",
  77: "Seine-et-Marne",
  78: "Yvelines",
  79: "Deux-Sèvres",
  80: "Somme",
  81: "Tarn",
  82: "Tarn-et-Garonne",
  83: "Var",
  84: "Vaucluse",
  85: "Vendée",
  86: "Vienne",
  87: "Haute-Vienne",
  88: "Vosges",
  89: "Yonne",
  90: "Territoire de Belfort",
  91: "Essonne",
  92: "Hauts-de-Seine",
  93: "Seine-Saint-Denis",
  94: "Val-de-Marne",
  95: "Val-d'Oise",
  971: "Guadeloupe",
  972: "Martinique",
  973: "Guyane",
  974: "La Réunion",
  975: "Saint-Pierre-et-Miquelon",
  976: "Mayotte",
  987: "Polynésie française",
  988: "Nouvelle-Calédonie",
};

export const departmentList = [
  "Ain",
  "Aisne",
  "Allier",
  "Alpes-de-Haute-Provence",
  "Hautes-Alpes",
  "Alpes-Maritimes",
  "Ardèche",
  "Ardennes",
  "Ariège",
  "Aube",
  "Aude",
  "Aveyron",
  "Bouches-du-Rhône",
  "Calvados",
  "Cantal",
  "Charente",
  "Charente-Maritime",
  "Cher",
  "Corrèze",
  "Corse",
  "Côte-d'Or",
  "Côtes-d'Armor",
  "Creuse",
  "Dordogne",
  "Doubs",
  "Drôme",
  "Eure",
  "Eure-et-Loire",
  "Finistère",
  "Corse-du-Sud",
  "Haute-Corse",
  "Gard",
  "Haute-Garonne",
  "Gers",
  "Gironde",
  "Hérault",
  "Ille-et-Vilaine",
  "Indre",
  "Indre-et-Loire",
  "Isère",
  "Jura",
  "Landes",
  "Loir-et-Cher",
  "Loire",
  "Haute-Loire",
  "Loire-Atlantique",
  "Loiret",
  "Lot",
  "Lot-et-Garonne",
  "Lozère",
  "Maine-et-Loire",
  "Manche",
  "Marne",
  "Haute-Marne",
  "Mayenne",
  "Meurthe-et-Moselle",
  "Meuse",
  "Morbihan",
  "Moselle",
  "Nièvre",
  "Nord",
  "Oise",
  "Orne",
  "Pas-de-Calais",
  "Puy-de-Dôme",
  "Pyrénées-Atlantiques",
  "Hautes-Pyrénées",
  "Pyrénées-Orientales",
  "Bas-Rhin",
  "Haut-Rhin",
  "Rhône",
  "Haute-Saône",
  "Saône-et-Loire",
  "Sarthe",
  "Savoie",
  "Haute-Savoie",
  "Paris",
  "Seine-Maritime",
  "Seine-et-Marne",
  "Yvelines",
  "Deux-Sèvres",
  "Somme",
  "Tarn",
  "Tarn-et-Garonne",
  "Var",
  "Vaucluse",
  "Vendée",
  "Vienne",
  "Haute-Vienne",
  "Vosges",
  "Yonne",
  "Territoire de Belfort",
  "Essonne",
  "Hauts-de-Seine",
  "Seine-Saint-Denis",
  "Val-de-Marne",
  "Val-d'Oise",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Saint-Pierre-et-Miquelon",
  "Mayotte",
  "Polynésie française",
  "Nouvelle-Calédonie",
];

export const regionList = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Saint-Pierre-et-Miquelon",
  "Mayotte",
  "Saint-Barthélemy",
  "Saint-Martin",
  "Terres australes et antarctiques françaises",
  "Wallis-et-Futuna",
  "Polynésie française",
  "Nouvelle-Calédonie",
];

export const department2region = {
  Ain: "Auvergne-Rhône-Alpes",
  Aisne: "Hauts-de-France",
  Allier: "Auvergne-Rhône-Alpes",
  "Alpes-de-Haute-Provence": "Provence-Alpes-Côte d'Azur",
  "Hautes-Alpes": "Provence-Alpes-Côte d'Azur",
  "Alpes-Maritimes": "Provence-Alpes-Côte d'Azur",
  Ardèche: "Auvergne-Rhône-Alpes",
  Ardennes: "Grand Est",
  Ariège: "Occitanie",
  Aube: "Grand Est",
  Aude: "Occitanie",
  Aveyron: "Occitanie",
  "Bouches-du-Rhône": "Provence-Alpes-Côte d'Azur",
  Calvados: "Normandie",
  Cantal: "Auvergne-Rhône-Alpes",
  Charente: "Nouvelle-Aquitaine",
  "Charente-Maritime": "Nouvelle-Aquitaine",
  Cher: "Centre-Val de Loire",
  Corrèze: "Nouvelle-Aquitaine",
  "Côte-d'Or": "Bourgogne-Franche-Comté",
  "Côtes-d'Armor": "Bretagne",
  Creuse: "Nouvelle-Aquitaine",
  Dordogne: "Nouvelle-Aquitaine",
  Doubs: "Bourgogne-Franche-Comté",
  Drôme: "Auvergne-Rhône-Alpes",
  Eure: "Normandie",
  "Eure-et-Loire": "Centre-Val de Loire",
  Finistère: "Bretagne",
  "Corse-du-Sud": "Corse",
  "Haute-Corse": "Corse",
  Gard: "Occitanie",
  "Haute-Garonne": "Occitanie",
  Gers: "Occitanie",
  Gironde: "Nouvelle-Aquitaine",
  Hérault: "Occitanie",
  "Ille-et-Vilaine": "Bretagne",
  Indre: "Centre-Val de Loire",
  "Indre-et-Loire": "Centre-Val de Loire",
  Isère: "Auvergne-Rhône-Alpes",
  Jura: "Bourgogne-Franche-Comté",
  Landes: "Nouvelle-Aquitaine",
  "Loir-et-Cher": "Centre-Val de Loire",
  Loire: "Auvergne-Rhône-Alpes",
  "Haute-Loire": "Auvergne-Rhône-Alpes",
  "Loire-Atlantique": "Pays de la Loire",
  Loiret: "Centre-Val de Loire",
  Lot: "Occitanie",
  "Lot-et-Garonne": "Nouvelle-Aquitaine",
  Lozère: "Occitanie",
  "Maine-et-Loire": "Pays de la Loire",
  Manche: "Normandie",
  Marne: "Grand Est",
  "Haute-Marne": "Grand Est",
  Mayenne: "Pays de la Loire",
  "Meurthe-et-Moselle": "Grand Est",
  Meuse: "Grand Est",
  Morbihan: "Bretagne",
  Moselle: "Grand Est",
  Nièvre: "Bourgogne-Franche-Comté",
  Nord: "Hauts-de-France",
  Oise: "Hauts-de-France",
  Orne: "Normandie",
  "Pas-de-Calais": "Hauts-de-France",
  "Puy-de-Dôme": "Auvergne-Rhône-Alpes",
  "Pyrénées-Atlantiques": "Nouvelle-Aquitaine",
  "Hautes-Pyrénées": "Occitanie",
  "Pyrénées-Orientales": "Occitanie",
  "Bas-Rhin": "Grand Est",
  "Haut-Rhin": "Grand Est",
  Rhône: "Auvergne-Rhône-Alpes",
  "Haute-Saône": "Bourgogne-Franche-Comté",
  "Saône-et-Loire": "Bourgogne-Franche-Comté",
  Sarthe: "Pays de la Loire",
  Savoie: "Auvergne-Rhône-Alpes",
  "Haute-Savoie": "Auvergne-Rhône-Alpes",
  Paris: "Île-de-France",
  "Seine-Maritime": "Normandie",
  "Seine-et-Marne": "Île-de-France",
  Yvelines: "Île-de-France",
  "Deux-Sèvres": "Nouvelle-Aquitaine",
  Somme: "Hauts-de-France",
  Tarn: "Occitanie",
  "Tarn-et-Garonne": "Occitanie",
  Var: "Provence-Alpes-Côte d'Azur",
  Vaucluse: "Provence-Alpes-Côte d'Azur",
  Vendée: "Pays de la Loire",
  Vienne: "Nouvelle-Aquitaine",
  "Haute-Vienne": "Nouvelle-Aquitaine",
  Vosges: "Grand Est",
  Yonne: "Bourgogne-Franche-Comté",
  "Territoire de Belfort": "Bourgogne-Franche-Comté",
  Essonne: "Île-de-France",
  "Hauts-de-Seine": "Île-de-France",
  "Seine-Saint-Denis": "Île-de-France",
  "Val-de-Marne": "Île-de-France",
  "Val-d'Oise": "Île-de-France",
  Guadeloupe: "Guadeloupe",
  Martinique: "Martinique",
  Guyane: "Guyane",
  "La Réunion": "La Réunion",
  "Saint-Pierre-et-Miquelon": "Saint-Pierre-et-Miquelon",
  Mayotte: "Mayotte",
  "Saint-Barthélemy": "Saint-Barthélemy",
  "Saint-Martin": "Saint-Martin",
  "Terres australes et antarctiques françaises": "Terres australes et antarctiques françaises",
  "Wallis-et-Futuna": "Wallis-et-Futuna",
  "Polynésie française": "Polynésie française",
  "Nouvelle-Calédonie": "Nouvelle-Calédonie",
};

export const region2department = {
  "Auvergne-Rhône-Alpes": ["Ain", "Allier", "Ardèche", "Cantal", "Drôme", "Isère", "Loire", "Haute-Loire", "Puy-de-Dôme", "Rhône", "Savoie", "Haute-Savoie"],
  "Bourgogne-Franche-Comté": ["Côte-d'Or", "Doubs", "Jura", "Nièvre", "Haute-Saône", "Saône-et-Loire", "Yonne", "Territoire de Belfort"],
  Bretagne: ["Côtes-d'Armor", "Finistère", "Ille-et-Vilaine", "Morbihan"],
  "Centre-Val de Loire": ["Cher", "Eure-et-Loire", "Indre", "Indre-et-Loire", "Loir-et-Cher", "Loiret"],
  Corse: ["Corse-du-Sud", "Haute-Corse"],
  "Grand Est": ["Ardennes", "Aube", "Marne", "Haute-Marne", "Meurthe-et-Moselle", "Meuse", "Moselle", "Bas-Rhin", "Haut-Rhin", "Vosges"],
  "Hauts-de-France": ["Aisne", "Nord", "Oise", "Pas-de-Calais", "Somme"],
  "Île-de-France": ["Paris", "Seine-et-Marne", "Yvelines", "Essonne", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne", "Val-d'Oise"],
  Normandie: ["Calvados", "Eure", "Manche", "Orne", "Seine-Maritime"],
  "Nouvelle-Aquitaine": [
    "Charente",
    "Charente-Maritime",
    "Corrèze",
    "Creuse",
    "Dordogne",
    "Gironde",
    "Landes",
    "Lot-et-Garonne",
    "Pyrénées-Atlantiques",
    "Deux-Sèvres",
    "Vienne",
    "Haute-Vienne",
  ],
  Occitanie: ["Ariège", "Aude", "Aveyron", "Gard", "Haute-Garonne", "Gers", "Hérault", "Lot", "Lozère", "Hautes-Pyrénées", "Pyrénées-Orientales", "Tarn", "Tarn-et-Garonne"],
  "Pays de la Loire": ["Loire-Atlantique", "Maine-et-Loire", "Mayenne", "Sarthe", "Vendée"],
  "Provence-Alpes-Côte d'Azur": ["Alpes-de-Haute-Provence", "Hautes-Alpes", "Alpes-Maritimes", "Bouches-du-Rhône", "Var", "Vaucluse"],
  Guadeloupe: ["Guadeloupe"],
  Martinique: ["Martinique"],
  Guyane: ["Guyane"],
  "La Réunion": ["La Réunion"],
  "Saint-Pierre-et-Miquelon": ["Saint-Pierre-et-Miquelon"],
  Mayotte: ["Mayotte"],
  "Saint-Barthélemy": ["Saint-Barthélemy"],
  "Saint-Martin": ["Saint-Martin"],
  "Terres australes et antarctiques françaises": ["Terres australes et antarctiques françaises"],
  "Wallis-et-Futuna": ["Wallis-et-Futuna"],
  "Polynésie française": ["Polynésie française"],
  "Nouvelle-Calédonie": ["Nouvelle-Calédonie"],
};

export const YOUNG_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
};

export const PHASE_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  IN_COMING: "IN_COMING",
  VALIDATED: "VALIDATED",
  CANCEL: "CANCEL",
  WAITING_AFFECTATION: "WAITING_AFFECTATION",
};
export const PHASE_STATUS_COLOR = {
  VALIDATED: "#6CC763",
  CANCEL: "#FE7B52",
};

export const YOUNG_PHASE = {
  INSCRIPTION: "INSCRIPTION",
  COHESION_STAY: "COHESION_STAY",
};

export const APPLICATION_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
  CANCEL: "CANCEL",
  ARCHIVED: "ARCHIVED",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  NOT_COMPLETED: "NOT_COMPLETED",
  PRESELECTED: "PRESELECTED",
  SIGNED_CONTRACT: "SIGNED_CONTRACT",
};

export const APPLICATION_STATUS_COLORS = {
  WAITING_VALIDATION: "#FE7B52",
  WAITING_CORRECTION: "#FEB951",
  VALIDATED: "#6CC763",
  DONE: "#1C7713",
  PRESELECTED: "#d9bb71",
  NOT_COMPLETED: "#d9bb71",
  SIGNED_CONTRACT: "#d9bb71",
  REFUSED: "#F8A9AD",
  CANCEL: "#ffa987",
  ARCHIVED: "#ffb3fb",
  IN_PROGRESS: "#382F79",
};

export function getPasswordErrorMessage(v, matomo) {
  if (!v) return "Ce champ est obligatoire";
  const schema = new passwordValidator();
  schema
    .is()
    .min(8) // Minimum length 8
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols(); // Must have symbols

  if (!schema.validate(v)) {
    matomo.logEvent("inscription", "password_failed");
    return "Votre mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
  }
}
