import React from "react";
import { Spinner } from "reactstrap";
import { FORMAT, MISSION_DOMAINS, PERIOD, translate } from "snu-lib";
import Sante from "../../assets/mission-domaines/sante";
import Sport from "../../assets/mission-domaines/sport";
import Solidarite from "../../assets/mission-domaines/solidarite";
import Environment from "../../assets/mission-domaines/environment";
import Citoyennete from "../../assets/mission-domaines/citoyennete";
import Securite from "../../assets/mission-domaines/securite";
import Education from "../../assets/mission-domaines/education";
import Culture from "../../assets/mission-domaines/culture";
import DefenseEtMemoire from "../../assets/mission-domaines/defense-et-memoire";
import PreparationMilitaire from "../../assets/mission-domaines/preparation-militaire";
import AcademicCap from "../../assets/icons/AcademicCap";
import Sun from "../../assets/icons/Sun";

// --- COMPONENTS

export function BigTitle({ children, className = "" }) {
  return <div className={`font-bold text-4xl text-gray-800 mb-1.5 ${className}`}>{children}</div>;
}

export function Title({ children, className = "" }) {
  return <div className={`font-bold text-xl text-[#242526] mb-8 text-center ${className}`}>{children}</div>;
}

export function MiniTitle({ children, className = "" }) {
  return <div className={`font-bold text-sm text-[#242526] mb-6 text-center ${className}`}>{children}</div>;
}

export function Box({ children, className = "" }) {
  return <div className={`bg-[#FFFFFF] text-sm text-gray-700 shadow-lg p-8 rounded-lg ${className}`}>{children}</div>;
}

export function Section({ children, className = "" }) {
  return <div className={`mt-16 ${className}`}>{children}</div>;
}

export function PlainButton({ children, className = "", onClick = () => {}, spinner = false }) {
  return (
    <button
      className={`flex items-center justify-center whitespace-nowrap px-12 py-2 cursor-pointer bg-blue-600 text-[#FFFFFF] border-[transparent] border-[1px] hover:!text-blue-600 hover:bg-[#FFFFFF] hover:border-blue-600 rounded-md ${className}`}
      onClick={onClick}>
      {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
      {children}
    </button>
  );
}

// --- CONSTANTS

export const PREF_DOMAINS = [
  {
    type: MISSION_DOMAINS.HEALTH,
    title: "Santé",
    text: "Accompagnement de personnes vulnérables comme des enfants hospitalisés, des personnes âgées, organisation d’actions pour le téléthon...",
    icon: <Sante />,
  },
  {
    type: MISSION_DOMAINS.SPORT,
    title: "Sport",
    text: "Animation d’un club ou d’une association sportive...",
    icon: <Sport />,
  },
  {
    type: MISSION_DOMAINS.SOLIDARITY,
    title: "Solidarité",
    text: "Aide aux sans-abris, aux migrants, aux personnes en situation de handicap ...",
    icon: <Solidarite />,
  },
  {
    type: MISSION_DOMAINS.ENVIRONMENT,
    title: "Environnement",
    text: "Protection de la nature et des animaux, promotion du tri des déchets",
    icon: <Environment />,
  },
  {
    type: MISSION_DOMAINS.CITIZENSHIP,
    title: "Citoyenneté",
    text: "Animation d’un conseil citoyen, aide à la lutte contre le racisme, l’homophobie...",
    icon: <Citoyennete />,
  },
  {
    type: MISSION_DOMAINS.SECURITY,
    title: "Sécurité",
    text: "Gendarmerie - sapeurs-pompiers - associations de protection civile",
    icon: <Securite />,
  },
  {
    type: MISSION_DOMAINS.EDUCATION,
    title: "Éducation",
    text: "Aide scolaire, aide à apprendre le français à Des personnes étrangères, animation dans des médiathèques",
    icon: <Education />,
  },
  {
    type: MISSION_DOMAINS.CULTURE,
    title: "Culture",
    text: "Restauration du patrimoine, aide à une association culturelle, bénévole au sein d’un salle de musique, d’un musée...",
    icon: <Culture />,
  },
  {
    type: MISSION_DOMAINS.DEFENSE,
    title: "Défense et mémoire",
    text: "Préparations militaires, participation à des commémorations, entretien de lieux de mémoire, participation à l’organisation de visites....",
    icon: <DefenseEtMemoire />,
  },
  {
    type: MISSION_DOMAINS.MILITARY,
    title: "Préparations militaires",
    text: "Accompagnement de personnes vulnérables comme des enfants hospitalisés, des personnes âgées, organisation d’actions pour le téléthon...",
    icon: <PreparationMilitaire />,
  },
];

// limitation de la constante FORMAT.
export const PREF_FORMATS = {
  [FORMAT.CONTINUOUS]: FORMAT.CONTINUOUS,
  [FORMAT.DISCONTINUOUS]: FORMAT.DISCONTINUOUS,
};

export const PREF_PERIOD_ICONS = {
  [PERIOD.DURING_HOLIDAYS]: <Sun />,
  [PERIOD.DURING_SCHOOL]: <AcademicCap />,
};

// --- FUNCTIONS

export function translateEnumToOptions(enumeration, icons) {
  return Object.keys(enumeration).map((key) => {
    return { value: key, label: translate(key), icon: icons ? icons[key] : undefined };
  });
}
