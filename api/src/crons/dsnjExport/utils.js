const lookupTable = [
  { Situation: "En voie générale ou technologique", "Statut professionnel": "Scolarisé" },
  { Situation: "En voie professionnelle (hors apprentissage)", "Statut professionnel": "Scolarisé" },
  { Situation: "En enseignement adapté", "Statut professionnel": "Scolarisé" },
  { Situation: "En apprentissage", "Statut professionnel": "Scolarisé" },
  { Situation: "Salarié(e)", "Statut professionnel": "Actif" },
  { Situation: "Indépendant(e)", "Statut professionnel": "Actif" },
  { Situation: "Auto-entrepreneur", "Statut professionnel": "Actif" },
  { Situation: "En ESAT, CAT ou en entreprise adaptée", "Statut professionnel": "Actif" },
  { Situation: "Inscrit(e) à Pole emploi", "Statut professionnel": "En recherche d'emploi" },
  { Situation: "Inscrit(e) à la Mission locale", "Statut professionnel": "En recherche d'emploi" },
  { Situation: "Inscrit(e) à Cap emploi", "Statut professionnel": "En recherche d'emploi" },
  { Situation: "Inscrit(e) nulle part", "Statut professionnel": "En recherche d'emploi" },
];

const situationTranslations = {
  GENERAL_SCHOOL: "Scolarisé",
  PROFESSIONAL_SCHOOL: "Scolarisé",
  AGRICULTURAL_SCHOOL: "Scolarisé",
  SPECIALIZED_SCHOOL: "Scolarisé",
  APPRENTICESHIP: "Scolarisé",
  EMPLOYEE: "Actif",
  INDEPENDANT: "Actif",
  SELF_EMPLOYED: "Actif",
  ADAPTED_COMPANY: "Actif",
  POLE_EMPLOI: "En recherche d'emploi",
  MISSION_LOCALE: "En recherche d'emploi",
  CAP_EMPLOI: "En recherche d'emploi",
  NOTHING: "En recherche d'emploi",
};

const genderTranslation = {
  male: "Masculin",
  female: "Féminin",
};

const findCohesionCenterBySessionId = (sessionId, sessions, centers) => {
  const session = sessions.find(({ _id }) => {
    return _id.toString() === sessionId.toString();
  });
  if (!session) return {};
  return centers.find(({ _id }) => _id.toString() === session.cohesionCenterId.toString());
};

const addToSlackRapport = (rapport, sessionName, exportKey) => {
  if (rapport[sessionName]) {
    rapport[sessionName].push(exportKey);
  } else {
    rapport[sessionName] = [exportKey];
  }
};

const printSlackInfo = (rapport) => {
  if (Object.keys(rapport).length === 0) {
    return "Pas d'export généré";
  }
  return Object.keys(rapport).reduce((previous, current) => {
    return `${previous ? `${previous}, ` : previous}${current}: ${rapport[current].join(", ")}`;
  }, "");
};

module.exports = {
  lookupTable,
  situationTranslations,
  genderTranslation,
  findCohesionCenterBySessionId,
  addToSlackRapport,
  printSlackInfo,
};
