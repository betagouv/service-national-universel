import { YOUNG_SOURCE, departmentList } from "snu-lib";

export const categories = [
  { label: "J'ai une question (éligibilité, séjour, missions, code de la route...)", value: "QUESTION" },
  { label: "J'ai un problème technique (inscription, compte, téléversement...)", value: "TECHNICAL" },
];

export const roleOptions = [
  { label: "Le volontaire/l'élève", value: "young" },
  { label: "Son représentant légal", value: "parent" },
];

export const departmentOptions = departmentList.map((d) => ({ value: d, label: d }))?.sort((a, b) => a.label.localeCompare(b.label));

export const alertMessage = {
  [YOUNG_SOURCE.CLE]: "Si vous avez une question sur votre parcours SNU, contactez directement votre référent classe. Il sera en mesure de vous répondre.",
  [YOUNG_SOURCE.VOLONTAIRE]: "Aucun sujet disponible.",
};

export const articleSummaries = [
  {
    title: "Séjour : Quelles sont les dates des séjours 2024 ?",
    description: "Vous souhaitez connaitre les dates des séjours proposés en 2024",
    slug: "je-souhaite-minscrire-au-snu",
  },
  {
    title: "🌲 Séjour : Changer les dates de mon séjour",
    description: "Vous n'êtes plus disponible pendant votre séjour ? Découvrez comment transférer votre inscription sur un autre séjour du SNU.",
    slug: "je-souhaite-changer-les-dates-de-mon-sejour",
  },
  {
    title: "😕 Séjour : Se désister",
    description: "Vous n'êtes plus en mesure de participer au séjour ? Vous pouvez vous désister directement depuis votre espace.",
    slug: "je-me-desiste-du-snu",
  },
  {
    title: "Séjour : Que prendre dans ma valise ?",
    description: "Voici le trousseau indicatif à apporter. Les consignes sur des affaires spécifiques vous seront directement communiquées par les centres.",
    slug: "dans-ma-valise-materiel-trousseau",
  },
  {
    title: "🏠 Séjour : Mon lieu d'affectation",
    description: "Tout savoir sur le lieu d’affectation",
    slug: "mon-lieu-daffectation",
  },
  {
    title: "🚗 Séjour : Le point de rassemblement",
    description: "Tout savoir sur le point de rassemblement",
    slug: "le-point-de-rassemblement",
  },
  {
    title: "🤝 Phase Engagement : Comment trouver une MIG ?",
    description: "Vous souhaitez des renseignements sur les MIG ?",
    slug: "comment-trouver-une-mig",
  },
  {
    title: "😐 Phase Engagement : Je ne trouve pas de mission qui m'intéresse",
    description: "Vous ne trouvez pas la MIG qui vous intéresse ?",
    slug: "je-ne-trouve-pas-de-mission-qui-minteresse",
  },
  {
    title: "📣 Phase Engagement : Journée défense et citoyenneté (JDC, recensement, JDM)",
    description: "Tout connaître sur la JDC ?",
    slug: "journee-defense-et-citoyennete",
  },
  {
    title: "🚗 Phase Engagement : Prise en charge du e-learning et de l'examen du code de la route",
    description: "Vous vous demandez comment obtenir votre code de la route via le SNU ?",
    slug: "permis-et-code-de-la-route",
  },
  {
    title: "Je n’arrive pas à compléter le formulaire d’inscription ",
    description: "Vous souhaitez avoir de l’aide pour compléter votre inscription",
    slug: "je-minscris-et-remplis-mon-profil",
  },
  {
    title: "J’ai un frère ou une soeur qui possède déjà un compte",
    description: "Votre frère ou votre soeur possède déjà un compte, vous souhaitez connaître la procédure pour créer un autre compte.",
    slug: "je-souhaite-inscrire-des-freressoeurs",
  },
];

// TODO: Move to DB
export const questions = [
  {
    category: "QUESTION",
    value: "PHASE_2_LICENSE",
    label: "Code de la route - Comment obtenir mes codes d'accès ?",
    articles: ["permis-et-code-de-la-route"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    value: "PHASE_0_ELIGIBILITY",
    category: "QUESTION",
    label: "Séjour -  Eligibilité aux séjours 2024",
    articles: ["je-souhaite-minscrire-au-snu"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    value: "PHASE_1_LUGGAGE",
    category: "QUESTION",
    label: "Séjour - Que prendre dans ma valise ?",
    articles: ["dans-ma-valise-materiel-trousseau"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_1_ITEMS",
    label: "Séjour - Dois-je apporter des affaires spécifiques (draps, duvets, autres...) ?",
    articles: ["dans-ma-valise-materiel-trousseau"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_1_AFFECTATION",
    label: "Séjour - Mon lieu d’affectation",
    articles: ["mon-lieu-daffectation"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_1_MEETING_POINT",
    label: "Séjour - Point de rassemblement",
    articles: ["le-point-de-rassemblement"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_1_WITHDRAWAL",
    label: "Séjour - Changer de séjour/se désister",
    articles: ["je-souhaite-changer-les-dates-de-mon-sejour", "je-me-desiste-du-snu"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2",
    label: "Phase Engagement - Comment trouver une Mission d'intérêt général ?",
    articles: ["comment-trouver-une-mig"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2_MISSION",
    label: "Phase Engagement - J'ai trouvé une Mission d'intérêt général mais elle n'est pas sur la plateforme, comment faire ?",
    articles: ["je-ne-trouve-pas-de-mission-qui-minteresse"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2_CANDIDATURE",
    label: "Phase Engagement - Je n'ai pas de nouvelle de ma candidature",
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2_JDC",
    label: "Phase Engagement - Ma JDC / Mon CIP",
    articles: ["journee-defense-et-citoyennete"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "TECHNICAL",
    value: "HTS_TO_CLE",
    label: "Inscription classe engagée : j’ai déjà un compte volontaire",
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "TECHNICAL",
    value: "CONNECTION",
    label: "Pour me connecter",
    roles: ["public"],
    parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "TECHNICAL",
    value: "COMPLETION",
    label: "Pour compléter mon formulaire d'inscription",
    articles: ["je-minscris-et-remplis-mon-profil"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "TECHNICAL",
    value: "SIBLINGS",
    label: "J’ai un frère ou une soeur qui possède déjà un compte ",
    articles: ["je-souhaite-inscrire-des-freressoeurs"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "TECHNICAL",
    value: "UPLOAD",
    label: "Je n'arrive pas à téléverser (déposer) un document",
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "TECHNICAL",
    value: "CONTRACT",
    label: "Je n'ai pas reçu le lien de validation du contrat d'engagement",
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "TECHNICAL",
    value: "OTHER",
    label: "J'ai un autre problème",
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
  },
];

/**
 * @param {("QUESTION"|"TECHNICAL")} category
 * @param {("public"|"young")} role: public: not logged in, young: young logged in
 * @param {"CLE"|"VOLONTAIRE"} parcours
 * @returns list of available questions
 */
export function getQuestions(category, role, parcours) {
  let res = questions;
  if (category) res = res.filter((e) => e.category === category);
  if (role) res = res.filter((e) => e.roles.includes(role));
  if (parcours) res = res.filter((e) => e.parcours.includes(parcours));
  return res;
}

export function getArticles(question) {
  const articleSlugs = questions.find((e) => e.value === question)?.articles;
  const articles = articleSlugs?.map((slug) => articleSummaries.find((e) => e.slug === slug));
  if (!articles) return [];
  return articles;
}

export function getCategoryFromQuestion(question) {
  return questions.find((e) => e.value === question)?.category;
}

export function getClasseIdFromLink(link) {
  try {
    return new URL(link).searchParams.get("id");
  } catch (e) {
    return undefined;
  }
}
