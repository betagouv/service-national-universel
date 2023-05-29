import PasswordValidator from "password-validator";
import React from "react";
import sanitizeHtml from "sanitize-html";
import slugify from "slugify";
import { formatStringLongDate, ROLES, translate, translateApplication, translateEngagement, translatePhase1, translatePhase2 } from "snu-lib";
import api from "../services/api";
import { translateModelFields } from "./translateFieldsModel";
import { environment } from "../config";
export * from "snu-lib";
export * from "./translateFieldsModel";

export const domains = ["Défense et mémoire", "Sécurité", "Solidarité", "Santé", "Éducation", "Culture", "Sport", "Environnement et développement durable", "Citoyenneté"];
export const status = ["Brouillon", "En attente de validation", "En attente de correction", "Validée", "Refusée", "Annulée", "Archivée"];

// todo clean up reliquats types de structure
export const associationTypes = [
  "Agrément jeunesse et éducation populaire",
  "Agrément service civique",
  "Association complémentaire de l'enseignement public",
  "Associations d'usagers du système de santé",
  "Association sportive affiliée à une fédération sportive agréée par l'État",
  "Agrément des associations de protection de l'environnement",
  "Association agréée de sécurité civile",
  "Autre agrément",
];
export const privateTypes = ["Établissement de santé privé d'intérêt collectif", "Entreprise agréée ESUS", "Autre"];
export const publicTypes = ["Collectivité territoriale", "Etablissement scolaire", "Etablissement public de santé", "Etablissement public", "Service de l'Etat"];
export const publicEtatTypes = [
  "SDIS (Service départemental d'Incendie et de Secours)",
  "Gendarmerie",
  "Police",
  "Armées",
  "Autre service de l'état",
  "Autre établissement public",
];

export const corpsEnUniforme = ["SDIS (Service départemental d'Incendie et de Secours)", "Gendarmerie", "Police", "Armées"];

// statuts/types pour les structures
export const legalStatus = ["PUBLIC", "PRIVATE", "ASSOCIATION", "OTHER"];
export const typesStructure = {
  PUBLIC: ["Collectivité territoriale", "Etablissement scolaire", "Etablissement public de santé", "Corps en uniforme", "Service de l'Etat", "Autre établissement public"],
  PRIVATE: ["Etablissement de santé privée d'intérêt collectif à but non lucratif", "Entreprise agréée ESUS", "Autre structure privée à but non lucratif"],
  ASSOCIATION: [
    "Agrément Jeunesse et Education Populaire",
    "Agrément Service Civique",
    "Association complémentaire de l'enseignement public",
    "Associations d'usagers du système de santé",
    "Association sportive affiliée à une fédération sportive agréée par l'Etat",
    "Agrément des associations de protection de l'environnement",
    "Association agréée de sécurité civile",
    "Autre agrément",
  ],
  OTHER: [],
};
export const sousTypesStructure = {
  "Collectivité territoriale": ["Commune", "EPCI", "Conseil départemental", "Conseil régional", "Autre"],
  "Etablissement scolaire": ["Collège", "Lycée", "Autre"],
  "Etablissement public de santé": ["EHPAD", "Centre hospitalier", "Autre"],
  "Corps en uniforme": ["Pompiers", "Police", "Gendarmerie", "Armées"],
};

export const confirmMessageChangePhase1Presence = (value) => {
  if (!value)
    return (
      <>
        <p>
          Vous allez passer ce volontaire <b>&quot;Non&nbsp;renseigné&quot;</b> au séjour de cohésion.
        </p>
        <p>Un email automatique sera envoyé aux représentants légaux du volontaire pour leur confirmer son arrivée au centre.</p>
        <p>
          <i>
            Pour toute information concernant le pointage des volontaires et les règles de validation au séjour,{" "}
            <a href="https://support.snu.gouv.fr/base-de-connaissance/regles-de-presence-des-volontaires-sur-mon-centre" target="_blank" rel="noreferrer">
              cliquez ici
            </a>
            .
          </i>
        </p>
      </>
    );
  if (value === "true")
    return (
      <>
        <p>
          Vous allez passer ce volontaire <b>&quot;Présent&quot;</b> au séjour de cohésion.
        </p>
        <p>Un email automatique sera envoyé aux représentants légaux du volontaire pour leur confirmer son arrivée au centre.</p>
        <p>
          <i>
            Pour toute information concernant le pointage des volontaires et les règles de validation au séjour,{" "}
            <a href="https://support.snu.gouv.fr/base-de-connaissance/regles-de-presence-des-volontaires-sur-mon-centre" target="_blank" rel="noreferrer">
              cliquez ici
            </a>
            .
          </i>
        </p>
      </>
    );
  if (value === "false")
    return (
      <>
        <p>
          Vous allez passer ce volontaire <b>&quot;Absent&quot;</b> au séjour de cohésion.
        </p>
        <p>
          <i>
            Pour toute information concernant le pointage des volontaires et les règles de validation au séjour,{" "}
            <a href="https://support.snu.gouv.fr/base-de-connaissance/regles-de-presence-des-volontaires-sur-mon-centre" target="_blank" rel="noreferrer">
              cliquez ici
            </a>
            .
          </i>
        </p>
      </>
    );
};

export function getPasswordErrorMessage(v) {
  if (!v) return "Ce champ est obligatoire";
  const schema = new PasswordValidator();
  schema
    .is()
    .min(12) // Minimum length 12
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols(); // Must have symbols

  if (!schema.validate(v)) {
    return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
  }
}

export const userIsResponsibleFromStructureMilitaryPreparation = async (user) => {
  if (!user || !user.structureId) return false;
  const { ok, data } = await api.get(`/structure/${user.structureId}`);
  if (!ok) return false;
  return data?.isMilitaryPreparation === "true";
};

export const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand("copy") ? res() : rej();
      textArea.remove();
    });
  }
};

export const replaceSpaces = (v) => v?.replace(/\s+/g, "+");
export const getLink = ({ base = "/", filter, filtersUrl = [] }) => {
  // console.log("filter: ", filter);
  if (filter?.region?.length) filtersUrl.push(`region=${replaceSpaces(filter?.region?.map((c) => c)?.join("~"))}`);
  if (filter?.cohort?.length) filtersUrl.push(`cohort=${replaceSpaces(filter?.cohort?.map((c) => c)?.join("~"))}`);
  if (filter?.cohorts?.length) filtersUrl.push(`cohort=${replaceSpaces(filter?.cohorts?.map((c) => c)?.join("~"))}`);
  if (filter?.department?.length) filtersUrl.push(`department=${replaceSpaces(filter?.department?.map((c) => c)?.join("~"))}`);
  if (filter?.academy?.length) filtersUrl.push(`academy=${replaceSpaces(filter?.academy?.map((c) => c)?.join("~"))}`);
  if (filter?.source?.length) filtersUrl.push(`isJvaMission=${replaceSpaces(filter?.source?.map((c) => c)?.join("~"))}`);
  if (filter?.status?.length) filtersUrl.push(`status=${replaceSpaces(filter?.status?.map((c) => c)?.join("~"))}`);
  if (filter?.statusPhase1?.length) filtersUrl.push(`statusPhase1=${replaceSpaces(filter?.statusPhase1?.map((c) => c)?.join("~"))}`);
  let res = base;
  if (filtersUrl?.length) res += `?${filtersUrl.join("&")}`;
  return res;
};

export const replaceSpacesNewList = (v) => v?.replace(/\s+/g, "%20");

export const getNewLink = ({ base = "/", filter, filtersUrl = [] }, from) => {
  Object.keys(filter).forEach((key) => {
    if (key === "cohorts" && from === "center") return;
    if (key === "cohort" && from === "session") return;
    if (filter[key]?.length) {
      filtersUrl.push(`${key}=${replaceSpacesNewList(filter[key]?.map((c) => `${c}`)?.join(","))}`);
    }
  });
  if (filter?.cohorts?.length && from === "center") {
    filtersUrl.push(`cohorts=${replaceSpacesNewList(filter?.cohorts?.map((c) => `${c}`)?.join(","))}`);
  }
  if (filter?.cohorts?.length && from === "session") {
    filtersUrl.push(`cohort=${replaceSpacesNewList(filter?.cohorts?.map((c) => `${c}`)?.join(","))}`);
  }

  let res = base;
  if (filtersUrl?.length) res += `?${filtersUrl.join("&")}`;
  return res;
};

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const ENABLE_PM = true;

export const htmlCleaner = (text) => {
  return sanitizeHtml(text, {
    allowedTags: ["b", "i", "em", "strong", "a", "li", "p", "h1", "h2", "h3", "u", "ol", "ul"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
  });
};

export function urlWithScheme(url) {
  if (!/^https?:\/\//i.test(url)) return `http://${url}`;
  return url;
}

export function slugifyFileName(str) {
  return slugify(str, { replacement: "-", remove: /[*+~.()'"!:@]/g });
}

export function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

export const regexPhoneFrenchCountries = /^((00|\+)(33|590|594|262|596|269|687|689|508|681)|0)[1-9]?(\d{8})$/;

export function isIsoDate(str) {
  if (!Date.parse(str)) return false;
  var d = new Date(str);
  return d.toISOString() === str;
}

export function translateHistory(path, value) {
  if (path === "/statusPhase1") {
    return translatePhase1(value);
  } else if (path === "/statusPhase2") {
    return translatePhase2(value);
  } else if (path === "/phase2ApplicationStatus") {
    return translateApplication(value);
  } else if (path === "/statusPhase2Contract") {
    return translateEngagement(value);
  } else if (isIsoDate(value)) {
    return formatStringLongDate(value);
  } else {
    return translate(value);
  }
}

function formatField(field) {
  let f = field;
  if (field.includes("correctionRequests")) f = "correctionRequests";
  // correctionRequests/0/field
  const match1 = field.match(/(.*)\/\d\/(.*)/);
  if (match1) f = match1.slice(1).join("/");
  // /files/fileCategory/mimetype
  const match2 = field.match(/.*\/(.*)\/.*/);
  if (match2) f = match2[1];
  // notes/0
  const match3 = field.match(/(.*)\/\d/);
  if (match3) f = match3[1];
  // files/fileCategory/0/
  const match4 = field.match(/files\/(.*)\/\d/);
  if (match4) f = match4[1];
  return f;
}

function formatValue(path, value) {
  if (!value) return "Vide";
  if (typeof value === "object") {
    if (Object.values(value).every((v) => !v?.length)) return "Vide";
    if (path.includes("Files")) return value.name;
    if (path.includes("correctionRequests")) return `${translateModelFields("young", value.field)} : ${value.message}`;
    if (path.includes("location")) return `Latitude: ${value.lat}, Longitude: ${value.lon}`;
    if (path.includes("notes")) return value.note?.substring(0, 100);
    if (path.includes("structureManager")) return `${value.firstName} ${value.lastName}`;
    return JSON.stringify(value);
  }
  return value;
}

function formatUser(user, role) {
  if (!user || !user?.firstName) return { firstName: "Acteur inconnu", lastName: "", role: "Donnée indisponible" };
  if (user.firstName?.includes("/Users/")) user.firstName = "Modification automatique";
  if (!user.role) {
    if (user.email) user.role = "Volontaire";
    if (!user.email && role !== ROLES.ADMIN) {
      user.firstName = "Modification automatique";
    }
  }
  return user;
}

export function createEvent(e, value, originalValue, role) {
  let event = {};
  event.path = e.path ? formatField(e.path.substring(1)) : null;
  event.user = formatUser(e.user, role);
  event.author = `${event.user.firstName} ${event.user.lastName}`;
  event.authorId = e.user ? e.user._id : null;
  event.op = e.op;
  event.date = e.date;
  event.value = formatValue(event.path, value);
  event.originalValue = formatValue(event.path, originalValue);
  event.ref = e.ref;
  event.refName = e.refName;
  return event;
}

function filterEmptyValues(e) {
  const ignoredValues = [null, undefined, "", "Vide", "[]", false];
  return (!e.value || !e.value.length || ignoredValues.includes(e.value)) && (!e.originalValue || !e.originalValue.length || ignoredValues.includes(e.originalValue));
}

function filterHiddenFields(e) {
  const hiddenFields = ["missionsInMail", "historic", "uploadedAt", "sessionPhase1Id", "correctedAt", "lastStatusAt", "token", "Token"];
  return hiddenFields.some((f) => e.path.includes(f));
}

export function formatHistory(data, role) {
  if (!data) return [];
  // Flatten history: each value inside each op is a separate event
  let history = [];
  for (const e of data) {
    for (const op of e.ops) {
      if (Array.isArray(op.value)) {
        for (const v of op.value) {
          history.push(createEvent({ ...e, ...op }, v, op.originalValue, role));
        }
      } else {
        history.push(createEvent({ ...e, ...op }, op.value, op.originalValue, role));
      }
    }
  }
  return history.filter((e) => !filterEmptyValues(e) && !filterHiddenFields(e));
}

export const getInitials = (word) =>
  (word || "UK")
    .match(/\b(\w)/g)
    .join("")
    .substring(0, 2)
    .toUpperCase();

export const getNetworkOptions = async (inputValue) => {
  const body = {
    query: { bool: { must: [{ term: { isNetwork: { value: "true" } } }] } },
    size: 50,
    track_total_hits: true,
  };
  if (inputValue) {
    body.query.bool.must.push({
      bool: {
        should: [
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "cross_fields",
              operator: "and",
            },
          },
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "phrase",
              operator: "and",
            },
          },
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "phrase_prefix",
              operator: "and",
            },
          },
        ],
        minimum_should_match: "1",
      },
    });
  }
  const { responses } = await api.esQuery("structure", body);
  return responses[0].hits.hits.map((hit) => {
    return { value: hit._source, _id: hit._id, label: hit._source.name, structure: hit._source };
  });
};

export const translateEmails = (t) => {
  switch (t) {
    case "opened":
      return "Ouvert";
    case "open":
      return "Ouvert";
    case "request":
      return "Envoyé";
    case "requests":
      return "Envoyé";
    case "delivered":
      return "Remis";
    case "deferred":
      return "Différé";
    case "clicked":
      return "Cliqué";
    case "clicks":
      return "Clics";
    case "unique_opened":
      return "Ouverture unique";
    case "invalid_email":
      return "Email invalide";
    case "sent":
      return "Envoyé";
    case "soft_bounce":
      return "Rebond (faible)";
    case "hard_bounce":
      return "Rebond (fort)";
    case "unsubscribe":
      return "Désinscrit";
    case "complaint":
      return "Plainte";
    case "blocked":
      return "Bloqué";
    case "error":
      return "Erreur";
    case "click":
      return "Clic";
    case "proxy_open":
      return "Ouverture par proxy";
    default:
      return t;
  }
};

export const debounce = (fn, delay) => {
  let timeOutId;
  return function (...args) {
    if (timeOutId) {
      clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const youngCheckinField = {
  [ROLES.ADMIN]: "youngCheckinForAdmin",
  [ROLES.HEAD_CENTER]: "youngCheckinForHeadOfCenter",
  [ROLES.REFERENT_REGION]: "youngCheckinForRegionReferent",
  [ROLES.REFERENT_DEPARTMENT]: "youngCheckinForDepartmentReferent",
};

export const CDN_BASE_URL =
  environment === "production" ? "https://cellar-c2.services.clever-cloud.com/cni-bucket-prod" : "https://cellar-c2.services.clever-cloud.com/cni-bucket-staging";

export const getRandomId = () => `${Math.floor(Math.random() * 100000)}-${Date.now()}`;

export const getImgUrl = (path) => {
  const imgUrl = new URL(path, import.meta.url).href;
  console.log("🚀 ~ file: index.jsx:464 ~ getImgUrl ~ imgUrl:", imgUrl);
  return imgUrl;
};
