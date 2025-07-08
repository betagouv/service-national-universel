import { STATUS } from "../constants";
import sanitizeHtml from "sanitize-html";
import { useState, useEffect } from "react";
import { ENVIRONMENT } from "../config";

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function urlify(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return ' <a href="' + url + '" target="_blank"> ' + url + " </a> ";
  });
}

export const TRANSLATE_ROLE = {
  ADMIN: "Admin",
  AGENT: "Agent",
  REFERENT_REGION: "Référent régional",
  REFERENT_DEPARTMENT: "Référent départemental",
};

export const getDocumentTitle = () => {
  let title = "SNUpport";
  switch (ENVIRONMENT) {
    case "development":
      return `${title} (Local)`;
    case "production":
      return title;
    default:
      return `${title} (Test)`;
  }
};

export const getStatusColor = (status) => {
  if (status === STATUS.NEW) return "text-[#C93D38] bg-[#FFDBD9]";
  if (status === STATUS.OPEN) return "text-[#92400E] bg-[#FEF3C7]";
  if (status === STATUS.PENDING) return "text-[#324C71] bg-[#9AD2FF]";
  if (status === STATUS.CLOSED) return "text-[#1F2937] bg-[#D1FAE5]";
  if (status === STATUS.DRAFT) return "text-[#E56717] bg-[#EFB261]";
  if (status === STATUS.TOTREAT) return "text-[#32257F] bg-[#C7D2FE]";
  return ""; // default
};

export const htmlCleaner = (text) => {
  const clean = sanitizeHtml(text, {
    allowedTags: ["b", "i", "em", "strong", "a", "li", "p", "h1", "h2", "h3", "u", "ol", "br", "div", "blockquote", "img"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      blockquote: ["style"],
      img: ["src", "alt", "style", "width", "height", "iwc-no-src"],
    },
    allowedSchemes: ["data", "http", "https"],
  });
  return sanitizeUrl(clean).trim();
};

const SAFE_URL_PATTERN = /(?:(?:https?|mailto|ftp|tel|file|sms):|[^&:/?#]*(?:[/?#]|$))/gi;

/** A pattern that matches safe data URLs. It only matches image, video, and audio types. */
const DATA_URL_PATTERN = /data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64/i;

function sanitizeUrl(url) {
  url = String(url);
  if (!url.includes("data:") && !(url.includes("http:") || url.includes("https:"))) {
    return url;
  }
  if (url.includes("data:") && (url.includes("http:") || url.includes("https:"))) {
    if (url.match(SAFE_URL_PATTERN) && url.match(DATA_URL_PATTERN)) return url;
    else return "";
  }
  if (url.includes("data:")) {
    if (url.match(DATA_URL_PATTERN)) return url;
    else return "";
  }
  if (url.includes("http:") || url.includes("https:")) {
    if (url.match(SAFE_URL_PATTERN)) return url;
    else return "";
  }
}

export function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const translateState = {
  OPEN: "Ouvert",
  NEW: "Nouveau",
  CLOSED: "Fermé",
  PENDING: "En attente",
  DRAFT: "Brouillon",
};

export const translateRole = {
  unknown: "Rôle inconnu",
  "admin exterior": "Admin non connecté",
  "young exterior": "Jeune non connecté",
  responsible: "Responsable structure",
  supervisor: "Superviseur",
  head_center: "Chef de centre",
  head_center_adjoint: "Chef de centre_adjoint",
  referent_sanitaire: "Référent sanitaire",
  referent_region: "Référent régional",
  referent_department: "Référent départemental",
  visitor: "Visiteur",
  young: "Volontaire",
  parent: "Parent",
  admin: "Admin",
  administrateur_cle: "Administrateur CLE",
  referent_classe: "Référent Classe",
  transporter: "Transporteur",
  dsnj: "DSNJ",
  injep: "INJEP",
  moderator: "Modérateur",
};

export const translateParcours = {
  CLE: "CLE",
  VOLONTAIRE: "HTS",
};

export function getDotColorClass(contactGroup, parcours) {
  switch (contactGroup) {
    case "young":
      switch (parcours) {
        case "CLE":
          return "bg-pink-500";
        case "VOLONTAIRE":
          return "bg-indigo-500";
        default:
          return "bg-red-100";
      }
    case "administrateur_cle":
    case "referent_classe":
      return "bg-pink-500";
    default:
      return "bg-gray-400";
  }
}

export const roleInitial = {
  unknown: "A",
  "admin exterior": "A",
  "young exterior": "A",
  responsible: "S",
  supervisor: "S",
  head_center: "C",
  head_center_adjoint: "C",
  referent_sanitaire: "C",
  referent_region: "R",
  referent_department: "R",
  visitor: "X",
  young: "V",
  admin: "M",
};

export const translateRoleBDC = {
  admin: "Modérateur",
  referent: "Référent",
  structure: "Structure",
  young: "Volontaire HTS",
  young_cle: "Volontaire CLE",
  head_center: "Chef de centre",
  head_center_adjoint: "Chef de centre adjoint",
  referent_sanitaire: "Référent sanitaire",
  public: "Public",
  visitor: "Visiteur",
  administrateur_cle_referent_etablissement: "Admin CLE - Chef établissement",
  administrateur_cle_coordinateur_cle: "Admin CLE - Coordinateur",
  referent_classe: "Référent Classe",
};

export const translateFeedback = {
  NEUTRAL: "😶 Neutre",
  WOW: "😍 WOW",
  THANKS: "😁 Merci",
  UNHAPPY: "😞 ️Mécontent",
};

export const translateVentilationOperator = {
  is: "est",
  "is not": "n'est pas",
  smaller: "plus petit",
  greater: "plus grand",
  contains: "contient",
  "not contains": "ne contient pas",
};

export const translateVentilationField = {
  status: "Etat",
  number: "Numéro",
  subject: "Titre",
  contactId: "Emetteur",
  agentId: "Agent",
  createdAt: "Créé le",
  updatedAt: "Mis à jour à",
  tags: "Etiquettes",
  textMessage: "Texte",
  lastUpdateAgent: "Mis à jour par (agent)",
  contactGroup: "Groupe émetteur",
  contactEmail: "Email émetteur",
  source: "Source",
  contactDepartment: "Departement",
  contactRegion: "Région",
};

export const translateVentilationFieldAction = {
  status: "Statut",
  agentId: "Agent",
  folder: "Nom d’un dossier",
  copyRecipient: "Destinataires en copie",
  foldersId: "Dossier",
  tag: "Tag",
};

export const translateSource = {
  CHAT: "Chat",
  MAIL: "Mail",
  PLATFORM: "Plateforme",
  FORM: "Formulaire",
};

export const sourceToIcon = { MAIL: "✉️", FORM: "📋", PLATFORM: "🖥", CHAT: "💬" };

export const translateAttributesSNU = (value) => {
  switch (value) {
    case "NONE":
      return "Aucun";
    case "AFFECTED":
      return "Affectée";
    case "NOT_DONE":
      return "Non réalisée";
    case "WAITING_VALIDATION":
      return "En attente de validation";
    case "WAITING_ACCEPTATION":
      return "En attente d'acceptation";
    case "WAITING_VERIFICATION":
      return "En attente de vérification d'éligibilité";
    case "WAITING_AFFECTATION":
      return "En attente d'affectation";
    case "WAITING_CORRECTION":
      return "En attente de correction";
    case "WAITING_UPLOAD":
      return "En attente de téléversement";
    case "IN_PROGRESS":
      return "En cours";
    case "VALIDATED":
      return "Validée";
    case "DELETED":
      return "Supprimée";
    case "WAITING_LIST":
      return "Sur liste complémentaire";
    case "CONTINUOUS":
      return "Mission regroupée sur des journées";
    case "DISCONTINUOUS":
      return "Mission répartie sur des heures";
    case "AUTONOMOUS":
      return "En autonomie";
    case "DRAFT":
      return "Brouillon";
    case "REFUSED":
      return "Refusée";
    case "CANCEL":
      return "Annulée";
    case "NOT_ELIGIBLE":
      return "Non éligible";
    case "EXEMPTED":
      return "Dispensée";
    case "ILLNESS":
      return "Maladie d'un proche ou du volontaire";
    case "DEATH":
      return "Mort d'un proche ou du volontaire";
    case "ADMINISTRATION_CANCEL":
      return "Annulation du séjour par l'administration (COVID 19)";
    case "ABANDON":
      return "Abandonnée";
    case "ABANDONED":
      return "Inscription Abandonnée";
    case "ARCHIVED":
      return "Archivée";
    case "DONE":
      return "Effectuée";
    case "WITHDRAWN":
      return "Désistée";
    case "NOT_COMPLETED":
      return "Non achevée";
    case "PRESELECTED":
      return "Présélectionnée";
    case "SIGNED_CONTRACT":
      return "Contrat signé";
    case "ASSOCIATION":
      return "Association";
    case "PUBLIC":
      return "Structure publique";
    case "PRIVATE":
      return "Structure privée";
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
    case "responsible":
      return "Responsable";
    case "head_center":
      return "Chef de centre";
    case "head_center_adjoint":
      return "Chef de centre adjoint";
    case "referent_sanitaire":
      return "Référent sanitaire";
    case "visitor":
      return "Visiteur";
    case "supervisor":
      return "Superviseur";
    case "manager_department":
      return "Chef de projet départemental";
    case "assistant_manager_department":
      return "Chef de projet départemental adjoint";
    case "manager_department_phase2":
      return "Référent départemental phase 2";
    case "manager_phase2":
      return "Référent phase 2";
    case "secretariat":
      return "Secrétariat";
    case "coordinator":
      return "Coordinateur régional";
    case "assistant_coordinator":
      return "Coordinateur régional adjoint";
    case "recteur_region":
      return "Recteur de région académique";
    case "recteur":
      return "Recteur d'académie";
    case "vice_recteur":
      return "Vice-recteur d'académie";
    case "dasen":
      return "Directeur académique des services de l'éducation nationale (DASEN)";
    case "sgra":
      return "Secrétaire général de région académique (SGRA)";
    case "sga":
      return "Secrétaire général d'académie (SGA)";
    case "drajes":
      return "Délégué régional académique à la jeunesse, à l'engagement et aux sports (DRAJES)";
    case "INSCRIPTION":
      return "Inscription";
    case "COHESION_STAY":
      return "Séjour de cohésion";
    case "INTEREST_MISSION":
      return "Mission d'intérêt général";
    case "CONTINUE":
      return "Poursuivre le SNU";
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
      return "Pendant l'après-midi";
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
      return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
    case "INVITATION_TOKEN_EXPIRED_OR_INVALID":
      return "Invitation invalide";
    case "USER_NOT_FOUND":
      return "Utilisateur introuvable";
    case "USER_NOT_EXISTS":
      return "L'utilisateur n'existe pas";
    case "OPERATION_UNAUTHORIZED":
      return "Opération non autorisée";
    case "FILE_CORRUPTED":
      return "Ce fichier est corrompu";
    case "YOUNG_ALREADY_REGISTERED":
      return "Utilisateur déjà inscrit";
    case "OPERATION_NOT_ALLOWED":
      return "Opération non autorisée";
    case "BIKE":
      return "Vélo";
    case "MOTOR":
      return "Motorisé";
    case "CARPOOLING":
      return "Covoiturage";
    case "WAITING_REALISATION":
      return "En attente de réalisation";
    case "PUBLIC_TRANSPORT":
      return "Transport en commun";
    case "IN_COMING":
      return "À venir";
    case "OTHER":
      return "Autre";
    case "other":
      return "Autre";
    case "SENT":
      return "Envoyée";
    case "UNSUPPORTED_TYPE":
      return "Type non pris en charge";
    case "LINKED_OBJECT":
      return "Objet lié";
    case "NO_TEMPLATE_FOUND":
      return "Template introuvable";
    case "INVALID_BODY":
      return "Requête invalide";
    case "INVALID_PARAMS":
      return "Requête invalide";
    case "EMAIL_OR_PASSWORD_INVALID":
      return "Email ou mot de passe invalide";
    case "PASSWORD_INVALID":
      return "Mot de passe invalide";
    case "EMAIL_INVALID":
      return "Email invalide";
    case "EMAIL_ALREADY_USED":
      return "Cette adresse e-mail est déjà utilisée";
    case "EMAIL_AND_PASSWORD_REQUIRED":
      return "Email et mot de passe requis";
    case "PASSWORD_NOT_MATCH":
      return "Les mots de passe ne correspondent pas";
    case "NEW_PASSWORD_IDENTICAL_PASSWORD":
      return "Le nouveau mot de passe est identique à l'ancien";
    default:
      return value;
  }
};

export const useKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};

export function formatTicketDate(dateString) {
  const creationDate = new Date(dateString);
  return creationDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const sortAgents = (specificOrder, a, b) => {
  const indexA = specificOrder.indexOf(a.firstName);
  const indexB = specificOrder.indexOf(b.firstName);

  if (indexA !== -1 || indexB !== -1) {
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }

  return a.firstName.localeCompare(b.firstName);
};

export function filterObjectByKeys(sourceObject, allowedKeys, options = { dropEmptyValue: false }) {
  const result = {};
  for (let key of allowedKeys) {
    if (key in sourceObject) {
      const value = sourceObject[key];
      if (options.dropEmptyValue) {
        if (!(value === "" || (Array.isArray(value) && value.length === 0))) {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}
export function normalizeString(str) {
  return str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, " ")
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export * from "./cohort.utils";
export * from "./date";
export * from "./dayjs.utils";
export * from "./region-and-departments.utils";
export * from "./searchParams.utils";
