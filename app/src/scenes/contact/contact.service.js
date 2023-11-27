import { YOUNG_SOURCE, departmentList } from "snu-lib";

export const categories = [
  { label: "J'ai une question", value: "QUESTION" },
  { label: "J'ai un problème technique", value: "TECHNICAL" },
];

export const articleSummaries = [
  {
    title: "Phase 0: Quelles sont les dates des séjours 2024 ?",
    description: "Vous souhaitez connaitre les dates des séjours proposés en 2024",
    slug: "je-souhaite-minscrire-au-snu",
  },
  {
    title: "🌲 Phase 1 : Changer les dates de mon séjour",
    description: "Vous n'êtes plus disponible pendant votre séjour ? Découvrez comment transférer votre inscription sur un autre séjour du SNU.",
    slug: "je-souhaite-changer-les-dates-de-mon-sejour",
  },
  {
    title: "😕 Phase 1 : Se désister",
    description: "Vous n'êtes plus en mesure de participer au séjour ? Vous pouvez vous désister directement depuis votre espace.",
    slug: "je-me-desiste-du-snu",
  },
  {
    title: "🤝 Phase 2 : Comment trouver une MIG ?",
    description: "Vous souhaitez des renseignements sur les MIG ?",
    slug: "comment-trouver-une-mig",
  },
  {
    title: "😐 Phase 2 : Je ne trouve pas de mission qui m'intéresse",
    description: "Vous ne trouvez pas la MIG qui vous intéresse ?",
    slug: "je-ne-trouve-pas-de-mission-qui-minteresse",
  },
  {
    title: "📣 Phase 2 : Journée défense et citoyenneté (JDC, recensement, JDM)",
    description: "Tout connaître sur la JDC ?",
    slug: "journee-defense-et-citoyennete",
  },
  {
    title: "🚗 Phase 2 : Prise en charge du e-learning et de l'examen du code de la route",
    description: "Vous vous demandez comment obtenir votre code de la route via le SNU ?",
    slug: "permis-et-code-de-la-route",
  },
  {
    title: "🌟 Phase 3 : Comment fonctionne la phase 3 ?",
    description: "Vous souhaitez comprendre le déroulement de la phase 3 du SNU ?",
    slug: "comment-fonctionne-la-phase-3",
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
    value: "PHASE_0_ELIGIBILITY",
    category: "QUESTION",
    label: "Phase 0 -  Eligibilité aux séjours 2024",
    articles: ["je-souhaite-minscrire-au-snu"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    value: "PHASE_1",
    category: "QUESTION",
    label: "Phase 1 - Mon séjour de cohésion",
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_1_WITHDRAWAL",
    label: "Phase 1 - Changer de séjour/se désister",
    articles: ["je-souhaite-changer-les-dates-de-mon-sejour", "je-me-desiste-du-snu"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2",
    label: "Phase 2 - Comment trouver une Mission d'intérêt général ?",
    articles: ["comment-trouver-une-mig"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2_MISSION",
    label: "Phase 2 - J'ai trouvé une Mission d'intérêt général mais elle n'est pas sur la plateforme, comment faire ?",
    articles: ["je-ne-trouve-pas-de-mission-qui-minteresse"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2_CANDIDATURE",
    label: "Phase 2 - Je n'ai pas de nouvelle de ma candidature",
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2_JDC",
    label: "Phase 2 - Ma JDC / Mon CIP",
    articles: ["journee-defense-et-citoyennete"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_2_LICENSE",
    label: "Phase 2 - Permis",
    articles: ["permis-et-code-de-la-route"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
  },
  {
    category: "QUESTION",
    value: "PHASE_3",
    label: "Phase 3 - L'engagement",
    articles: ["comment-fonctionne-la-phase-3"],
    roles: ["public", "young"],
    parcours: [YOUNG_SOURCE.VOLONTAIRE],
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
    parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
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
    value: "DOWNLOAD",
    label: "Je n'arrive pas à télécharger un document depuis la plateforme",
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

export const departmentOptions = departmentList.map((d) => ({ value: d, label: d }))?.sort((a, b) => a.label.localeCompare(b.label));

/**
 * @param {("QUESTION"|"TECHNICAL")} category 
 * @param {("public"|"young")} role: public: not logged in, young: young logged in
 * @param {"CLE"|"VOLONTAIRE"} parcours 
 * @returns list of available questions
 */
export function getQuestionOptions(category, role, parcours) {
  return questions.filter((e) => e.category === category && e.roles.includes(role) && e.parcours.includes(parcours));
}

export function getArticles(question) {
  const articleSlugs = questions.find((e) => e.value === question)?.articles;
  const articles = articleSlugs?.map((slug) => articleSummaries.find((e) => e.slug === slug));
  if (!articles) return [];
  return articles;
}
