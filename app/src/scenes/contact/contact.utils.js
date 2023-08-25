export const formOptions = {
  step0: [
    { label: "Un volontaire", value: "young" },
    { label: "Un représentant légal", value: "parent" },
  ],
  step1: [
    {
      label: "J'ai une question",
      value: "QUESTION",
      subOptions: [
        {
          label: "Phase 1 - Mon séjour de cohésion",
          value: "PHASE_1",
          articles: [],
        },
        {
          label: "Phase 1 - Changer de séjour/se désister",
          value: "PHASE_1_WITHDRAWAL",
          articles: [
            {
              title: "Phase 1 : Changer les dates de mon séjour",
              emoji: "🌲",
              body: "Vous n'êtes plus disponible pendant votre séjour ? Découvrez comment transférer votre inscription sur un autre séjour du SNU.",
              slug: "je-souhaite-changer-les-dates-de-mon-sejour",
            },
            {
              title: "Phase 1 : Se désister",
              emoji: "😕",
              body: "Vous n'êtes plus en mesure de participer au séjour ? Vous pouvez vous désister directement depuis votre espace.",
              slug: "je-me-desiste-du-snu",
            },
          ],
        },
        {
          label: "Phase 2 - Comment trouver une Mission d'intérêt général ?",
          value: "PHASE_2",
          articles: [
            {
              title: "Phase 2 : Comment trouver une MIG ?",
              emoji: "🤝",
              body: "Vous souhaitez des renseignements sur les MIG ?",
              slug: "comment-trouver-une-mig",
            },
          ],
        },
        {
          label: "Phase 2 - J'ai trouvé une Mission d'intérêt général mais elle n'est pas sur la plateforme, comment faire ?",
          value: "PHASE_2_MISSION",
          articles: [
            {
              title: "Phase 2 : Je ne trouve pas de mission qui m'intéresse",
              emoji: "😐",
              body: "Vous ne trouvez pas la MIG qui vous intéresse ?",
              slug: "je-ne-trouve-pas-de-mission-qui-minteresse",
            },
          ],
        },
        {
          label: "Phase 2 - Je n'ai pas de nouvelle de ma candidature",
          value: "PHASE_2_CANDIDATURE",
          articles: [],
        },
        {
          label: "Phase 2 - Ma JDC / Mon CIP",
          value: "PHASE_2_JDC",
          articles: [
            {
              title: "Phase 2 : Journée défense et citoyenneté (JDC, recensement, JDM)",
              emoji: "📣",
              body: "Tout connaître sur la JDC ?",
              slug: "journee-defense-et-citoyennete",
            },
          ],
        },
        {
          label: "Phase 2 - Permis",
          value: "PHASE_2_LICENSE",
          articles: [
            {
              title: "Phase 2 : Prise en charge du e-learning et de l'examen du code de la route",
              emoji: "🚗",
              body: "Vous vous demandez comment obtenir votre code de la route via le SNU ?",
              slug: "permis-et-code-de-la-route",
            },
          ],
        },
        {
          label: "Phase 3 - L'engagement",
          value: "PHASE_3",
          articles: [
            {
              title: "Phase 3 : Comment fonctionne la phase 3 ?",
              emoji: "🌟",
              body: "Vous souhaitez comprendre le déroulement de la phase 3 du SNU ?",
              slug: "comment-fonctionne-la-phase-3",
            },
          ],
        },
      ],
    },
    {
      label: "J'ai un problème technique",
      value: "TECHNICAL",
      subOptions: [
        { label: "Pour me connecter", value: "CONNECTION" },
        { label: "Je n'arrive pas à télécharger un document depuis la plateforme", value: "DOWNLOAD" },
        { label: "Je n'arrive pas à téléverser (déposer) un document", value: "UPLOAD" },
        { label: "Je n'ai pas reçu le lien de validation du contrat d'engagement", value: "CONTRACT" },
        { label: "J'ai un autre problème", value: "OTHER" },
      ],
    },
  ],
};