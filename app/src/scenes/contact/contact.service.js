import { YOUNG_SOURCE, departmentList } from "snu-lib";

export const categories = [
  { label: "J’ai une question (missions, code de la route, JDC…)", value: "QUESTION" },
  { label: "J’ai un problème technique (téléversement, lien validation de contrat…)", value: "TECHNICAL" },
];

export const roleOptions = [
  { label: "Le volontaire/l'élève", value: "young" },
  { label: "Son représentant légal", value: "parent" },
];

export const departmentOptions = departmentList.map((d) => ({ value: d, label: d }))?.sort((a, b) => a.label.localeCompare(b.label));

export const articleSummaries = [
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
];

// TODO: Move to DB
export const questions = [
  // 1. CODE DE LA ROUTE
  {
    category: "QUESTION",
    value: "PHASE_2_LICENSE",
    label: "Code de la route - Comment obtenir mes codes d'accès ?",
    articles: ["permis-et-code-de-la-route"],
    roles: ["public", "young"],
    displayForm: true,
  },
  // 2. QUESTIONS D'ENGAGEMENT (Phase 2)
  {
    category: "QUESTION",
    value: "PHASE_2",
    label: "Phase Engagement - Comment trouver une Mission d'intérêt général ?",
    articles: ["comment-trouver-une-mig"],
    roles: ["public", "young"],
    displayForm: true,
  },
  {
    category: "QUESTION",
    value: "PHASE_2_EQUIVALENCE",
    label: "Phase Engagement : Faire reconnaître un engagement déjà réalisé",
    roles: ["public", "young"],
    displayForm: true,
  },
  {
    category: "QUESTION",
    value: "PHASE_2_MISSION",
    label: "Phase Engagement - J'ai trouvé une Mission d'intérêt général mais elle n'est pas sur la plateforme, comment faire ?",
    articles: ["je-ne-trouve-pas-de-mission-qui-minteresse"],
    roles: ["public", "young"],
    displayForm: true,
  },
  {
    category: "QUESTION",
    value: "PHASE_2_CANDIDATURE",
    label: "Phase Engagement - Je n'ai pas de nouvelle de ma candidature",
    roles: ["public", "young"],
    displayForm: true,
  },
  {
    category: "QUESTION",
    value: "PHASE_2_JDC",
    label: "Phase Engagement - Ma JDC / Mon CIP",
    articles: ["journee-defense-et-citoyennete"],
    roles: ["public", "young"],
    displayForm: true,
  },
  // 4. QUESTIONS TECHNIQUES
  {
    category: "TECHNICAL",
    value: "CONNECTION",
    label: "Pour me connecter",
    roles: ["public"],
    displayForm: true,
  },
  {
    category: "TECHNICAL",
    value: "UPLOAD",
    label: "Je n'arrive pas à téléverser (déposer) un document",
    roles: ["public", "young"],
    displayForm: true,
  },
  {
    category: "TECHNICAL",
    value: "CONTRACT",
    label: "Je n'ai pas reçu le lien de validation du contrat d'engagement",
    roles: ["public", "young"],
    displayForm: true,
  },
  {
    category: "TECHNICAL",
    value: "OTHER",
    label: "J'ai un autre problème",
    roles: ["public", "young"],
    displayForm: true,
  },
];

/**
 * @param {("QUESTION"|"TECHNICAL")} [category]
 * @param {("public"|"young")} [role]: public: not logged in, young: young logged in
 * @returns list of available questions
 */
export function getQuestions(category, role) {
  return questions
    .filter((e) => (category ? e.category === category : true))
    .filter((e) => (role ? e.roles.includes(role) : true));
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

export function getClasseMessage(classe) {
  return `J'ai un compte volontaire et je souhaite m'inscrire au SNU dans le cadre de ma classe engagée : ${classe.name} (${classe.uniqueKeyAndId}), établissement : ${classe.etablissement?.name}.`;
}
