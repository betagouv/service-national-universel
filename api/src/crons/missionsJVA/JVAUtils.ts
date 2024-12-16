import { MISSION_DOMAINS } from "snu-lib";

export const jva2SnuDomaines = {
  education: MISSION_DOMAINS.EDUCATION,
  environnement: MISSION_DOMAINS.ENVIRONMENT,
  sport: MISSION_DOMAINS.SPORT,
  sante: MISSION_DOMAINS.HEALTH,
  "solidarite-insertion": MISSION_DOMAINS.SOLIDARITY,
  "prevention-protection": MISSION_DOMAINS.SECURITY,
  "culture-loisirs": MISSION_DOMAINS.CULTURE,
  "benevolat-competences": MISSION_DOMAINS.SOLIDARITY,
  "vivre-ensemble": MISSION_DOMAINS.CITIZENSHIP,
};

export const JvaStructureException = [
  "6890", //Fédération Médico-psychosociale à la Personne-Initiative
  "14392", //Autisme espoir
  "13419", //AUTISME ESPOIR VERS L'ÉCOLE
];

export const SnuStructureException = [
  "62b9f02788469607439b733a", //Fédération Médico-psychosociale à la Personne-Initiative
  "63762279c6ccb008d446f6bc", //Autisme espoir
  "62de85c299f28207ac826fc5", //AUTISME ESPOIR VERS L'ÉCOLE
];
