export const PERIOD_HOLIDAYS = {
  SUMMER: "SUMMER",
  AUTUMN: "AUTUMN",
  DECEMBER: "DECEMBER",
  WINTER: "WINTER",
  SPRING: "SPRING",
};

export const PERIOD_SCHOOL = {
  EVENING: "EVENING",
  END_DAY: "END_DAY",
  WEEKEND: "WEEKEND",
};

export const MISSION_DOMAINS = {
  CITIZENSHIP: "CITIZENSHIP",
  CULTURE: "CULTURE",
  DEFENSE: "DEFENSE",
  EDUCATION: "EDUCATION",
  ENVIRONMENT: "ENVIRONMENT",
  HEALTH: "HEALTH",
  SECURITY: "SECURITY",
  SOLIDARITY: "SOLIDARITY",
  SPORT: "SPORT",
};

export const PROFESSIONNAL_PROJECT = {
  UNIFORM: "UNIFORM",
  OTHER: "OTHER",
  UNKNOWN: "UNKNOWN",
};

export const PROFESSIONNAL_PROJECT_PRECISION = {
  FIREFIGHTER: "FIREFIGHTER",
  POLICE: "POLICE",
  ARMY: "ARMY",
};

export const PERIOD = {
  HOLIDAYS: "HOLIDAYS",
  SCHOOL: "SCHOOL",
};

export const translate = (value) => {
  switch (value) {
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
    default:
      return value;
  }
};
