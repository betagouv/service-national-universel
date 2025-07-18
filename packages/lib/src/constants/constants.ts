const YOUNG_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  REINSCRIPTION: "REINSCRIPTION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
  IN_PROGRESS: "IN_PROGRESS",
  WITHDRAWN: "WITHDRAWN",
  DELETED: "DELETED",
  WAITING_LIST: "WAITING_LIST",
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
  ABANDONED: "ABANDONED",
  NOT_AUTORISED: "NOT_AUTORISED",
} as const;

const YOUNG_STATUS_LIST = Object.values(YOUNG_STATUS);

const YOUNG_STATUS_PHASE1 = {
  WAITING_AFFECTATION: "WAITING_AFFECTATION",
  AFFECTED: "AFFECTED",
  EXEMPTED: "EXEMPTED",
  DONE: "DONE",
  NOT_DONE: "NOT_DONE",
  WITHDRAWN: "WITHDRAWN",
  WAITING_LIST: "WAITING_LIST",
} as const;

const YOUNG_STATUS_PHASE1_MOTIF = {
  ILLNESS: "ILLNESS",
  DEATH: "DEATH",
  ADMINISTRATION_CANCEL: "ADMINISTRATION_CANCEL",
  OTHER: "OTHER",
} as const;

const YOUNG_STATUS_PHASE2 = {
  WAITING_REALISATION: "WAITING_REALISATION",
  IN_PROGRESS: "IN_PROGRESS",
  VALIDATED: "VALIDATED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export enum YOUNG_ACCOUNT_STATUS {
  ACTIVE = "ACTIVE",
  PRECOMPTE = "PRECOMPTE",
}

const CONTRACT_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VALIDATED: "VALIDATED",
} as const;

const YOUNG_STATUS_PHASE3 = {
  WAITING_REALISATION: "WAITING_REALISATION",
  WAITING_VALIDATION: "WAITING_VALIDATION",
  VALIDATED: "VALIDATED",
  WITHDRAWN: "WITHDRAWN",
} as const;

const YOUNG_PHASE = {
  INSCRIPTION: "INSCRIPTION",
  COHESION_STAY: "COHESION_STAY",
  INTEREST_MISSION: "INTEREST_MISSION",
  CONTINUE: "CONTINUE",
} as const;

const PHASE_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  IN_COMING: "IN_COMING",
  VALIDATED: "VALIDATED",
  CANCEL: "CANCEL",
  WAITING_AFFECTATION: "WAITING_AFFECTATION",
} as const;

const SESSION_STATUS = {
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
} as const;

const APPLICATION_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_VERIFICATION: "WAITING_VERIFICATION",
  WAITING_ACCEPTATION: "WAITING_ACCEPTATION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
  CANCEL: "CANCEL",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  ABANDON: "ABANDON",
} as const;

const EQUIVALENCE_STATUS = {
  WAITING_VERIFICATION: "WAITING_VERIFICATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
} as const;

const PROFESSIONNAL_PROJECT = {
  UNIFORM: "UNIFORM",
  OTHER: "OTHER",
  UNKNOWN: "UNKNOWN",
} as const;

const PROFESSIONNAL_PROJECT_PRECISION = {
  FIREFIGHTER: "FIREFIGHTER",
  POLICE: "POLICE",
  ARMY: "ARMY",
} as const;

const MISSION_DOMAINS = {
  CITIZENSHIP: "CITIZENSHIP",
  CULTURE: "CULTURE",
  DEFENSE: "DEFENSE",
  EDUCATION: "EDUCATION",
  ENVIRONMENT: "ENVIRONMENT",
  HEALTH: "HEALTH",
  SECURITY: "SECURITY",
  SOLIDARITY: "SOLIDARITY",
  SPORT: "SPORT",
  MILITARY: "MILITARY",
} as const;

const JVA_MISSION_DOMAINS = {
  education: "éducation",
  "solidarite-insertion": "solidarité/insertion",
  environnement: "environnement",
  sport: "sport",
  "vivre-ensemble": "vivre-ensemble",
  "culture-loisirs": "culture/loisirs",
  sante: "santé",
  "benevolat-competences": "bénévolat/compétences",
  "prevention-protection": "prévention/protection",
} as const;

const YOUNG_SITUATIONS = {
  GENERAL_SCHOOL: "GENERAL_SCHOOL",
  PROFESSIONAL_SCHOOL: "PROFESSIONAL_SCHOOL",
  AGRICULTURAL_SCHOOL: "AGRICULTURAL_SCHOOL",
  SPECIALIZED_SCHOOL: "SPECIALIZED_SCHOOL",
  APPRENTICESHIP: "APPRENTICESHIP",
  EMPLOYEE: "EMPLOYEE",
  INDEPENDANT: "INDEPENDANT",
  SELF_EMPLOYED: "SELF_EMPLOYED",
  ADAPTED_COMPANY: "ADAPTED_COMPANY",
  POLE_EMPLOI: "POLE_EMPLOI",
  MISSION_LOCALE: "MISSION_LOCALE",
  CAP_EMPLOI: "CAP_EMPLOI",
  NOTHING: "NOTHING", // @todo find a better key --'
} as const;

const YOUNG_SCHOOLED_SITUATIONS = {
  GENERAL_SCHOOL: YOUNG_SITUATIONS.GENERAL_SCHOOL,
  PROFESSIONAL_SCHOOL: YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  // AGRICULTURAL_SCHOOL: constants.YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  SPECIALIZED_SCHOOL: YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  APPRENTICESHIP: YOUNG_SITUATIONS.APPRENTICESHIP,
} as const;

const FORMAT = {
  CONTINUOUS: "CONTINUOUS",
  DISCONTINUOUS: "DISCONTINUOUS",
  AUTONOMOUS: "AUTONOMOUS",
} as const;

const MISSION_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
  REFUSED: "REFUSED",
  CANCEL: "CANCEL",
  ARCHIVED: "ARCHIVED",
} as const;

const PERIOD = {
  WHENEVER: "WHENEVER",
  DURING_HOLIDAYS: "DURING_HOLIDAYS",
  DURING_SCHOOL: "DURING_SCHOOL",
} as const;

const TRANSPORT = {
  PUBLIC_TRANSPORT: "PUBLIC_TRANSPORT",
  BIKE: "BIKE",
  MOTOR: "MOTOR",
  CARPOOLING: "CARPOOLING",
  OTHER: "OTHER",
} as const;

const MISSION_PERIOD_DURING_HOLIDAYS = {
  SUMMER: "SUMMER",
  AUTUMN: "AUTUMN",
  DECEMBER: "DECEMBER",
  WINTER: "WINTER",
  SPRING: "SPRING",
} as const;

const MISSION_PERIOD_DURING_SCHOOL = {
  EVENING: "EVENING",
  END_DAY: "END_DAY",
  WEEKEND: "WEEKEND",
} as const;

const STRUCTURE_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
} as const;

const DEFAULT_STRUCTURE_NAME = "Ma nouvelle Structure";

const INTEREST_MISSION_LIMIT_DATE = {
  2019: "23 mars 2021",
  2020: "31 décembre 2021",
  2021: "30 juin 2022",
} as const;

const ES_NO_LIMIT = 10_000;

const SENDINBLUE_SMS = {
  PARENT1_CONSENT: {
    template: (young, cta) =>
      `Bonjour,
Nous avons besoin de votre accord pour que ${young.firstName} ${young.lastName} participe au SNU !
Cliquez ici pour le donner : ${cta}
Service National Universel`,
    tag: "sms_1",
  },
  PARENT2_CONSENT: {
    template: (young, cta) =>
      `Bonjour,
${young.firstName} ${young.lastName} souhaite participer au SNU !
Donnez votre accord pour l’utilisation de son droit à l’image en cliquant ici : ${cta}
Service National Universel`,
    tag: "sms_2",
  },
  PARENT1_CONSENT_REMINDER: {
    template: (young, cta) =>
      `Bonjour,
Vous n’avez pas encore donné votre accord pour que ${young.firstName} ${young.lastName} participe au SNU !
Cliquez ici pour le donner : ${cta}
Service National Universel`,
    tag: "sms_3",
  },
  OUTDATED_ID_PROOF: {
    template: (young, cta) =>
      `Bonjour,
La pièce d’identité de ${young.firstName} ${young.lastName} est ou sera périmée au moment du séjour.
Cliquez ici pour les démarches à suivre : ${cta}
Service National Universel`,
    tag: "sms_4",
  },
};

const WITHRAWN_REASONS = [
  {
    value: "unavailable_perso",
    label: "Non disponibilité pour motif familial ou personnel",
    roles: ["young", "admin"],
  },
  {
    value: "unavailable_pro",
    label: "Non disponibilité pour motif scolaire ou professionnel",
    roles: ["young", "admin"],
  },
  {
    value: "change_date_july_2023",
    label: "Changements des dates de mon séjour du 5 au 17 juillet 2023",
    cohortOnly: ["Juillet 2023"],
    roles: ["young", "admin"],
  },
  {
    value: "no_interest",
    label: "Perte d'intérêt pour le SNU",
    roles: ["young", "admin"],
  },
  {
    value: "bad_affectation",
    label: "L'affectation ne convient pas",
    roles: ["young", "admin"],
  },
  {
    value: "can_not_go_metting_point",
    label: "Impossibilité de se rendre au point de rassemblement",
    roles: ["young", "admin"],
  },
  {
    value: "bad_mission",
    label: "L'offre de mission ne convient pas",
    phase2Only: true,
    roles: ["young", "admin"],
  },
  {
    value: "non-confirmation",
    label: "Non confirmation de la participation au séjour",
    roles: ["admin"],
  },
  {
    value: "other",
    label: "Autre",
    roles: ["young", "admin"],
  },
];

const CONSENTMENT_TEXTS = {
  young: [
    "A lu et accepte les Conditions générales d'utilisation de la plateforme du Service national universel ;",
    "A pris connaissance des modalités de traitement de mes données personnelles ;",
    "Est volontaire, sous le contrôle des représentants légaux, pour effectuer la session 2022 du Service National Universel qui comprend la participation au séjour de cohésion puis la réalisation d'une mission d'intérêt général ;",
    "Certifie l'exactitude des renseignements fournis ;",
    "Si en terminale, a bien pris connaissance que si je suis convoqué(e) pour les épreuves du second groupe du baccalauréat entre le 6 et le 8 juillet 2022, je ne pourrai pas participer au séjour de cohésion entre le 3 et le 15 juillet 2022(il n’y aura ni dérogation sur la date d’arrivée au séjour de cohésion ni report des épreuves).",
  ],
  parents: [
    "Confirmation d'être titulaire de l'autorité parentale / le représentant légal du volontaire ;",
    "Autorisation du volontaire à participer à la session 2022 du Service National Universel qui comprend la participation au séjour de cohésion puis la réalisation d'une mission d & apos; intérêt général ;",
    "Engagement à renseigner le consentement relatif aux droits à l'image avant le début du séjour de cohésion ;",
    "Engagement à renseigner l'utilisation d'autotest COVID avant le début du séjour de cohésion ;",
    "Engagement à remettre sous pli confidentiel la fiche sanitaire ainsi que les documents médicaux et justificatifs nécessaires à son arrivée au centre de séjour de cohésion ;",
    "Engagement à ce que le volontaire soit à jour de ses vaccinations obligatoires, c'est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP), et pour les volontaires résidents de Guyane, la fièvre jaune.",
  ],
};

const FILE_STATUS_PHASE1 = {
  TO_UPLOAD: "TO_UPLOAD",
  WAITING_VERIFICATION: "WAITING_VERIFICATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
} as const;

const ACADEMIQUE_DOMAINS = [
  "ac-clermont.fr",
  "ac-grenoble.fr",
  "ac-besancon.fr",
  "ac-dijon.fr",
  "ac-rennes.fr",
  "ac-orleans-tours.fr",
  "ac-corse.fr",
  "ac-nancy-metz.fr",
  "ac-reims.fr",
  "ac-strasbourg.fr",
  "ac-guadeloupe.fr",
  "ac-guyane.fr",
  "ac-amiens.fr",
  "ac-lille.fr",
  "ac-creteil.fr",
  "ac-paris.fr",
  "ac-versailles.fr",
  "ac-reunion.fr",
  "ac-martinique.fr",
  "ac-mayotte.fr",
  "ac-normandie.fr",
  "ac-bordeaux.fr",
  "ac-limoges.fr",
  "ac-poitiers.fr",
  "ac-noumea.nc",
  "ac-montpellier.fr",
  "ac-toulouse.fr",
  "ac-nantes.fr",
  "ac-polynesie.pf",
  "ac-aix-marseille.fr",
  "ac-nice.fr",
  "ac-spm.fr",
  "ac-lyon.fr",
  "gouv.fr",
];

const MINISTRES = [
  {
    date_end: "07-25-2020",
    ministres: [
      "Jean-Michel Blanquer, Ministre de l’Éducation Nationale, de la Jeunesse et des Sports",
      "Gabriel Attal, Secrétaire d’État auprès du ministre Éducation Nationale et de la Jeunesse",
    ],
    template: "certificates/certificateTemplate-2019.png",
  },
  {
    date_end: "05-19-2022",
    ministres: [
      "Jean-Michel Blanquer, Ministre de l’Éducation Nationale, de la Jeunesse et des Sports",
      "Sarah El Haïry, Secrétaire d’État auprès du ministre de l'Éducation Nationale et de la Jeunesse",
    ],
    template: "certificates/certificateTemplate.png",
  },
  {
    date_end: "07-04-2022",
    ministres: ["Pap Ndiaye, Ministre de l’Éducation Nationale et de la Jeunesse"],
    template: "certificates/certificateTemplate_2022.png",
  },
  {
    date_end: "04-05-2023",
    ministres: [
      "Pap Ndiaye, Ministre de l’Éducation Nationale et de la Jeunesse",
      "Sébastien Lecornu, Ministre des Armées",
      "Sarah El Haïry, Secrétaire d'État après du ministre de 'Éducation nationale et de la Jeunesse et du ministre des Armées, \
      chargée de la jeunesse et du Service national universel",
    ],
    template: "certificates/certificateTemplate_juillet_2022.png",
  },
  {
    date_end: "08-18-2023",
    ministres: [
      "Pap Ndiaye, Ministre de l’Éducation Nationale et de la Jeunesse",
      "Sébastien Lecornu, Ministre des Armées",
      "Sarah El Haïry, Secrétaire d'État après du ministre de 'Éducation nationale et de la Jeunesse et du ministre des Armées, \
      chargée de la jeunesse et du Service national universel",
    ],
    template: "certificates/certificateTemplate2023.png",
  },
  {
    date_end: "02-15-2024",
    ministres: [
      "Gabriel Attal, Ministre de l’Éducation Nationale et de la Jeunesse",
      "Sébastien Lecornu, Ministre des Armées",
      "Prisca Thevenot, Secrétaire d'État auprès du ministre des Armées et du ministre de 'Éducation nationale et de la Jeunesse , \
      chargée de la Jeunesse et du Service national universel",
    ],
    template: "certificates/certificateTemplate2023-08-18.png",
  },
  {
    date_end: "10-20-2024",
    ministres: ["Nicole Belloubet, Ministre de l'Education Nationale et de la Jeunesse", "Sebastien Lecornu, Ministre des Armées"],
    template: "certificates/certificateTemplate2024_2.png",
  },
  {
    date_end: "03-13-2050", // ! Changer ici à l'ajout d'un nouveau
    ministres: ["Corinne Orzechowski"],
    template: "certificates/certificateTemplate2024_3.png",
  },
];

const FILE_KEYS = [
  "cniFiles",
  "highSkilledActivityProofFiles",
  "parentConsentmentFiles",
  "autoTestPCRFiles",
  "imageRightFiles",
  "dataProcessingConsentmentFiles",
  "rulesFiles",
  "equivalenceFiles",
];

const MILITARY_FILE_KEYS = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];

const MILITARY_PREPARATION_FILES_STATUS = {
  VALIDATED: "VALIDATED",
  WAITING_VERIFICATION: "WAITING_VERIFICATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  REFUSED: "REFUSED",
};

const SESSION_FILE_KEYS = ["time-schedule", "pedago-project"];

const ENGAGEMENT_TYPES = [
  "Service Civique",
  "BAFA",
  "Jeune Sapeur Pompier",
  "Certification Union Nationale du Sport scolaire (UNSS)",
  "Engagements lycéens",
  "Préparation militaire hors offre MIG des armées",
  "Escadrilles Air Jeunesse (EAJ)",
  "Autre",
];

const UNSS_TYPE = [
  "Jeunes arbitres",
  "Jeunes juges",
  "Jeunes coachs / capitaines",
  "Jeunes dirigeants",
  "Jeunes écoresponsables",
  "Jeunes interprètes",
  "Jeunes organisateurs",
  "Jeunes reporters",
  "Jeunes secouristes",
  "Jeunes vice-présidents",
];

const ENGAGEMENT_LYCEEN_TYPES = [
  "Elu au sein du conseil des délégués pour la vie lycéenne (CVL)",
  "Elu au sein du conseil académique de la vie lycéenne (CAVL)",
  "Elu au sein des conseils régionaux des jeunes",
];

const GRADES = {
  NOT_SCOLARISE: "NOT_SCOLARISE",
  "4eme": "4eme",
  "3eme": "3eme",
  "2ndePro": "2ndePro",
  "2ndeGT": "2ndeGT",
  "1ereGT": "1ereGT",
  "1erePro": "1erePro",
  TermGT: "TermGT",
  TermPro: "TermPro",
  "2ndeCAP": "2ndeCAP",
  "1ereCAP": "1ereCAP",
  Autre: "Autre",
} as const;

const TEMPLATE_DESCRIPTIONS = {
  1: "Le contact favori est le SMS + clic sur le bouton “confirmer” à la fin de l’inscription",
  2: "Moyen de contact favori est le SMS + Clic sur le bouton “confirmer” à la fin de l’inscription",
  3: "J+7 après l’envoi du 1er SMS si aucune action n’a été faite par le représentant légal (accord ou désaccord)",
  4: "Si l’ID du jeune est / sera périmée au moment du séjour + moment où le jeune renseigne la date de péremption de son ID",
  61: "Statut parcours SNU : désisté",
  63: 'Statut de la Mission "validée',
  65: 'Statut inscription "en attente de validation',
  145: "Dossier d’éligibilité aux PM validé",
  146: "Mise en attente de correction du dossier d’éligibilité aux PM",
  147: "Refus de documents pour une préparation militaire",
  148: "Nouveau déclencheur : candidat clique sur candidater à une PM OU Dossier PM validé par le référent départemental",
  149:
    "Le dossier d’éligibilité PM passe en statut ‘en attente de vérification” (/Volontaire a uploadé ses 3 ou 4 pièces ET candidaté à une PM)\n" +
    "Dans le cas de multi-candidatures, le référent n’est sollicité qu’une fois : lors de la première candidature. Une fois que le dossier est validé, le référent n’est plus sollicité et c’est les tuteurs des PM qui reçoivent https://www.notion.so/TUTEUR-PREPARATION-MILITAIRE-Jeune-valid-65c7a1c14e6740afbf93eed8f51157d7",
  150: `Clic sur "Valider et envoyer le contrat d'engagement aux parties prenantes`,
  151: 'Statut pour la mission "validée',
  152: "Statut candidature ⇒ refusée",
  154: "Validation de la phase 2 Félicitations pour votre engagement : vous avez validé la phase 2 du SNU !",
  155: 'Statut pour la mission "annulée',
  156: 'Statut du volontaire sur la mission "en attente de validation',
  157: "Click sur Démarche de réinitialisation de mot de passe",
  158: "Création d’un compte pour un nouveau référent",
  159: "Invitation d'un nouveau référent régional",
  160: "Invitation d'une nouvelle structure (avec responsable de structure renseigné)",
  161: "Invitation d'un  nouveau modérateur sur la plateforme",
  162: "Invitation mail de création de compte",
  163: "Un responsable de la structure (ou un administrateur SNU) invite un nouveau responsable dans la structure",
  164: 'Statut de la Mission "en attente de correction',
  165: 'Statut de la Mission "refusée',
  166: "Création manuelle d'une inscription",
  167: "Phase 0 : validée",
  168: "Création manuelle d'un volontaire par un référent",
  169: "Statut inscription ⇒ en attente de correction",
  170: "Mission proposée à un volontaire par un tiers",
  171: "Passage sur liste complémentaire à l’instruction du dossier",
  172: "Statut inscription ⇒ refusée",
  173: "Volontaire est approuvé sur la mission ⇒ quand la structure / le tuteur clique sur “approuver la candidature”",
  174: "Statut phase 3 : en attente de validation",
  175: "Click sur Enregistrer les modifications alors que le contrat était déjà envoyé et validé par le signataire.",
  176: `Click depuis le contrat sur "Enregistrer et envoyer à toutes les parties -prenantes" OU click sur "Renvoyer le lien du contrat d'engagement`,
  180: "Statut candidature ⇒ annulée par le volontaire",
  182: "Clic sur le lien : je m'envoi un document depuis la plateforme",
  183: "Toutes les parties-prenantes ont validé le contrat d'engagement (statut contrat : Validé)",
  185: "Candidature à une PM",
  191: "Création (validation automatique) de la structure (2ème étape)",
  192: "Quand une mission passe du statut “brouillon” à “en attente de validation”",
  194: 'Statut de la Mission "en attente de validation',
  195: "Mission en attente de validation depuis 7 jours",
  196: 'Statut du volontaire sur la mission "approuvée',
  197: "Rappel candidature pas répondu à J+7",
  198: "Relance quand le volontaire n'a pas accepté ou décliné la mission au bout de 7 jours",
  199: "Le contrat d’engagement est en brouillon depuis plus de au moins 24h",
  200: "Validation de la phase 3",
  201: "Statut de PM : En attente de vérification d'éligibilité",
  204: "Statut de la mission Archivée",
  205: 'J-7 Statut de la mission "archivée',
  208: "Réponse reçue sur un ticket",
  209: "Relance quand le contrat d'engagement n'a pas été envoyé - statut “brouillon” (J+7 après validation de la candidature)",
  211: "Un référent créé une nouvelle structure avec une mission depuis la plateforme",
  212: "Mail hebdo aux structures, tous les lundi à 12h",
  213: "Fin de la mission (date du contrat d'engagement ou date de la fiche mission) : mail envoyé automatiquement le lundi de la semaine suivante à 9h",
  214: "Volontaire abandonne sa mission",
  215: "Changement de département d'adresse du volontaire",
  216: "Changement de département d'adresse du volontaire",
  217: "Un agent a répondu à sa demande depuis la plateforme, besoin d'aide.",
  218: "Demande d'aide reçue (étiquette : AGENT_Referent departemental + AGENT_Referent  regional)",
  219: "Fin de la pré-inscription avant le passage à l’inscription",
  220: 'Relance - inscription "En cours" depuis 3, 7, 20 jours (délai challengeable) - scenario : https://automation.sendinblue.com/scenarios/3#',
  221: 'Statut inscription "en attente de correction" depuis 3, 7, 20 jours (délai challengeable) - Scenario : https://automation.sendinblue.com/scenarios/7#',
  227: "Statut de la mission ⇒ archivée, envoi à tous les candidats dont le statut n'est pas : Validée ou Effectuée",
  228: "Clic sur le bouton : relancer le volontaire pour téléversement des pièces PM (Par référent ou admin)",
  229: "Récapitulatif hebdo activité sur région , envoyé 1 fois par semaine (mercredi ?)",
  231: "Envoi le mardi & jeudi (8h)",
  232: "Récapitulatif quotidien envoyé à 8heures (sauf we) lorsqu'il y a de l'activité",
  233: "Statut mission ⇒ annulée",
  234: "Changement de statut phase 1 => effectuée",
  237: "Email 1 fois par semaine si au moins 1 mission dans un périmètre de 20Km autour du jeune.",
  241: "Envoi le lundi (à 8h)",
  251: "En cas de réaffectation post-désistement (ou affectation manuelle)",
  261: "Statut de la mission ⇒ annulée, envoi à tous les candidats dont le statut n'est pas : Validée ou Effectuée",
  267: "SCRIPT réinscription volontaire désisté",
  268: "SCRIPT - Réinscription des volontaires désistés",
  269: "Click sur Anonymisation par modérateur",
  275: "Relance après changement de statut phase 1→ effectuée (relance M1, M3 et M6)",
  276: "Relance après changement de statut phase 2 → effectuée (relance M1, M6 et M12)",
  286: "Création d’un compte visiteur par un tiers",
  289: "Une mission est archivée automatiquement à la fin de sa date de validité",
  302: "Le volontaire est noté présent par le chef de centre",
  324: "Un volontaire a effectué un changement de séjour",
  325: "Changement de cohorte par un volontaire",
  331: 'Relance - inscription "En cours" - scenario : https://www.notion.so/eb431335b0dc43f5aff6fe2dba3ae649',
  341: "Un volontaire déposant une demande d’équivalence MIG",
  342: "Demande d’équivalence MIG refusée",
  343: "Demande d'équivalence MIG a été acceptée",
  344: "Volontaire a demandé la vérification de son dossier équivalence MIG",
  346: "Le référent demande la correction du dossier équivalence MIG",
  348: "Un volontaire a téléversé un document sur son compte volontaire",
  349: "Demande de correction sur un document",
  350: "Un document déposé a bien été validé",
  353: "Demande du référent de rajouter des documents clic sur le bouton relance volontaire",
  354: "Le référent clique sur le bouton relance pour demander la fiche sanitaire au volontaire",
  378: "Activation du compte d’un référent départemental",
  391: "Activation du compte d’un référent régional",
  410: "Bouton mail valider son séjour",
  419: "Génération de la liste pour consultation PDF",
  421: "Un jeune en liste complémentaire surbooking passe en affecté",
  571: "",
  588: "Relance du volontaire suite à action d’un administrateur (référent / modérateur)",
  594: "J+13 après la proposition de mission si le statut de la candidature est toujours “waiting_validation”",
  599: "Quand les candidatures d’un volontaire sont annulées parce qu’il a réalisé ses 84h de MIG",
  601: "Quand un jeune laisse son adresse mail sur la page inscription hors période d’inscription https://moncompte.snu.gouv.fr/inscription",
  602: "Réception d’une demande (quel que soit le canal) sur le support",
  605: "Clic sur le bouton “confirmer” à la fin de la préinscription",
  609: "",
  610: "Si l’ID du jeune est / sera périmée au moment du séjour",
  611: "Pré-inscription terminée - Clic sur “m’inscrire au SNU”",
  612: "Quand le représentant légal clique sur “Donner mon consentement”",
  613: "Quand le représentant légal ne donne pas son consentement",
  615: "Un référent est inactif sur la plateforme depuis 6 mois",
  616: "J+7 après l’envoi du template 615",
  620: "Clic sur le bouton s’inscrire au SNU et attente du consentement du représentant légal",
  621: "Relance à J+7 du dernier envoi du template 605",
  623: "Quand le représentant légal clique sur “Donner mon consentement”",
  634: "Quand le représentant légal ne donne pas son consentement",
  637: "La création d’une session sur un centre pour demander la validation de la session, à destination des modérateurs suivants",
  650: "Clôture des instructions - dossier non finalisé - basculement autre cohorte",
  651: "Clôture instruction - dossier non finalisé - plus éligible au SNU",
  655: "Jeunes restés en waiting validation après clôture instruction + encore éligibles SNU",
  656: "Jeunes restés en waiting validation après clôture instruction + non éligibles SNU",
  657: "Jeunes restés en waiting correction après clôture instruction + encore éligibles SNU",
  658: "Jeunes restés en waiting correction après clôture instruction + non éligibles SNU",
  662: "Invitation mail de création de compte",
  663: "Changement manuel ou automatique de l’affectation et / ou du PDR",
  665: "Quand un volontaire ou un référent change de séjour - A ne pas envoyer si le représentant légal n’a pas encore donné son consentement",
  671: "Un modérateur, référent régional ou référent départemental demande au RL une modification du droit à l’image",
  672: "Demande de modification sur le plan de transport",
  673: "La demande de modification de la ligne a été refusée",
  674: "La demande de modification de la ligne a été validée",
  697: "Quand un référent / modérateur clique sur le bouton “relance” pour demander au chef de centre de téléverser l’EDT de son séjour",
  935: "Jeunes restés en waiting validation après clôture instruction + encore éligibles SNU",
  936: "Jeunes restés en waiting correction après clôture instruction + encore éligibles SNU",
  1248: "Statut parcours SNU : désisté",
  1261: 'Statut inscription "en attente de validation',
  1258: "Dossier d'éligibilité aux PM validé",
  1259: "Mise en attente de correction du dossier d'éligibilité aux PM",
  1260: "Refus de documents pour une préparation militaire",
  1257: 'Statut pour la mission "validée',
  1253: "Statut candidature ⇒ refusée",
  1256: "Validation de la phase 2 Félicitations pour votre engagement : vous avez validé la phase 2 du SNU !",
  1308: "Click sur Démarche de réinitialisation de mot de passe",
  1283: "Création manuelle d'une inscription",
  1284: "Phase 0 : validée",
  1247: "Création manuelle d'un volontaire par un référent",
  1285: "Statut inscription ⇒ en attente de correction",
  1229: "Mission proposée à un volontaire par un tiers",
  1286: "Passage sur liste complémentaire à l'instruction du dossier",
  1246: "Statut inscription ⇒ refusée",
  1287: "Click sur Enregistrer les modifications alors que le contrat était déjà envoyé et validé par le signataire.",
  1288: `Click depuis le contrat sur "Enregistrer et envoyer à toutes les parties -prenantes" OU click sur "Renvoyer le lien du contrat d'engagement`,
  1262: "Statut candidature ⇒ annulée par le volontaire",
  1310: "Clic sur le lien : je m'envoi un document depuis la plateforme",
  1282: "Toutes les parties-prenantes ont validé le contrat d'engagement (statut contrat : Validé)",
  1281: "Relance quand le volontaire n'a pas accepté ou décliné la mission au bout de 7 jours",
  1280: "Validation de la phase 3",
  1279: "Statut de PM : En attente de vérification d'éligibilité",
  1278: "Réponse reçue sur un ticket",
  1277: "Fin de la pré-inscription avant le passage à l'inscription",
  1276: 'Relance - inscription "En cours" depuis 3, 7, 20 jours (délai challengeable) - scenario : https://automation.sendinblue.com/scenarios/3#',
  1275: 'Statut inscription "en attente de correction" depuis 3, 7, 20 jours (délai challengeable) - Scenario : https://automation.sendinblue.com/scenarios/7#',
  1274: "Statut de la mission ⇒ archivée, envoi à tous les candidats dont le statut n'est pas : Validée ou Effectuée",
  1273: "Clic sur le bouton : relancer le volontaire pour téléversement des pièces PM (Par référent ou admin)",
  1234: "Email 1 fois par semaine si au moins 1 mission dans un périmètre de 20Km autour du jeune.",
  1236: "Statut de la mission ⇒ annulée, envoi à tous les candidats dont le statut n'est pas : Validée ou Effectuée",
  1233: "Relance après changement de statut phase 1→ effectuée (relance M1, M3 et M6)",
  1263: "Relance après changement de statut phase 2 → effectuée (relance M1, M6 et M12)",
  1289: "Une mission est archivée automatiquement à la fin de sa date de validité",
  1290: "Le volontaire est noté présent par le chef de centre",
  1291: "Changement de cohorte par un volontaire",
  1240: 'Relance - inscription "En cours" - scenario : https://www.notion.so/eb431335b0dc43f5aff6fe2dba3ae649',
  1249: "Demande d'équivalence MIG refusée",
  1251: "Demande d'équivalence MIG a été acceptée",
  1292: "Volontaire a demandé la vérification de son dossier équivalence MIG",
  1250: "Le référent demande la correction du dossier équivalence MIG",
  1239: "Un volontaire a téléversé un document sur son compte volontaire",
  1293: "Demande de correction sur un document",
  1294: "Un document déposé a bien été validé",
  1296: "Demande du référent de rajouter des documents clic sur le bouton relance volontaire",
  1297: "Le référent clique sur le bouton relance pour demander la fiche sanitaire au volontaire",
  1231: "Bouton mail valider son séjour",
  1298: "Un jeune en liste complémentaire surbooking passe en affecté",
  1299: "",
  1230: "J+13 après la proposition de mission si le statut de la candidature est toujours waiting_validation",
  1215: "Quand un jeune laisse son adresse mail sur la page inscription hors période d'inscription https://moncompte.snu.gouv.fr/inscription",
  1255: "Réception d'une demande (quel que soit le canal) sur le support",
  1300: "Clic sur le bouton Confirmer à la fin de la préinscription",
  1301: "",
  1302: "Si l'ID du jeune est / sera périmée au moment du séjour",
  1238: "Pré-inscription terminée - Clic sur M'inscrire au SNU",
  1303: "Quand le représentant légal clique sur Donner mon consentement",
  1304: "Quand le représentant légal ne donne pas son consentement",
  1245: "Clic sur le bouton s'inscrire au SNU et attente du consentement du représentant légal",
  1305: "Relance à J+7 du dernier envoi du template 605",
  1244: "Quand le représentant légal clique sur Donner mon consentement",
  1243: "Quand le représentant légal ne donne pas son consentement",
  1271: "Clôture des instructions - dossier non finalisé - basculement autre cohorte",
  1270: "Clôture instruction - dossier non finalisé - plus éligible au SNU",
  1269: "Jeunes restés en waiting validation après clôture instruction + encore éligibles SNU",
  1268: "Jeunes restés en waiting validation après clôture instruction + non éligibles SNU",
  1267: "Jeunes restés en waiting correction après clôture instruction + non éligibles SNU",
  1272: "Changement manuel ou automatique de l'affectation et / ou du PDR",
  1307: "Quand un volontaire ou un référent change de séjour - A ne pas envoyer si le représentant légal n'a pas encore donné son consentement",
  1241: "Un modérateur, référent régional ou référent départemental demande au RL une modification du droit à l'image",
};

const MIME_TYPES = {
  EXCEL: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  CSV: "text/csv",
  PLAIN: "text/plain",
} as const;

const STRUCTURE_LEGAL_STATUS = {
  PUBLIC: "PUBLIC",
  ASSOCIATION: "ASSOCIATION",
  PRIVATE: "PRIVATE",
  OTHER: "OTHER",
} as const;

//CLE
const STATUS_CLASSE = {
  WITHDRAWN: "WITHDRAWN",
  CREATED: "CREATED",
  ASSIGNED: "ASSIGNED",
  VERIFIED: "VERIFIED",
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

const STATUS_PHASE1_CLASSE = {
  WAITING_AFFECTATION: "WAITING_AFFECTATION",
  AFFECTED: "AFFECTED",
  NOT_DONE: "NOT_DONE",
  DONE: "DONE",
} as const;

const CLE_TYPE = {
  GENERAL_HIGHSCHOOL: "Lycée Général",
  GENERAL_AND_TECHNOLOGICAL_HIGHSCHOOL: "Lycée Général et Technologique",
  PROFESSIONAL_HIGHSCHOOL: "Lycée Professionnel",
  POLYVALENT_HIGHSCHOOL: "Lycée Polyvalent",
  AGRICULTURAL_HIGHSCHOOL: "Lycée Agricole (EPLEFPA)",
  MILITARY_HIGHSCHOOL: "Lycée Militaire",
  OTHER: "Autre",
} as const;

const CLE_SECTOR = {
  PUBLIC: "Statut public",
  PRIVATE: " Statut privé",
} as const;

const CLE_COLORATION = {
  SPORT: "SPORT",
  ENVIRONMENT: "ENVIRONMENT",
  DEFENSE: "DEFENSE",
  RESILIENCE: "RESILIENCE",
} as const;

const CLE_GRADE = {
  "4eme": "4eme",
  "3eme": "3eme",
  "2ndePro": GRADES["2ndePro"],
  "2ndeGT": GRADES["2ndeGT"],
  "1ereGT": GRADES["1ereGT"],
  "1erePro": GRADES["1erePro"],
  TermGT: GRADES["TermGT"],
  TermPro: GRADES["TermPro"],
  "1ereCAP": "1ereCAP",
  "2ndeCAP": "2ndeCAP",
  CAP: "CAP",
  Autre: "Autre",
} as const;

export const CLE_FILIERE = {
  GENERAL_AND_TECHNOLOGIC: "Générale et technologique",
  PROFESSIONAL: "Professionnelle",
  APPRENTICESHIP: "Apprentissage",
  ADAPTED: "Enseignement adapté",
  MIXED: "Mixte",
} as const;

const YOUNG_SOURCE = {
  VOLONTAIRE: "VOLONTAIRE",
  CLE: "CLE",
} as const;

const COHORT_TYPE = {
  VOLONTAIRE: "VOLONTAIRE",
  CLE: "CLE",
} as const;

const COHORT_STATUS = {
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

const TYPE_CLASSE = {
  GROUP: "GROUP",
  FULL: "FULL",
} as const;

const LIMIT_DATE_ESTIMATED_SEATS = new Date("2024-08-28");
const LIMIT_DATE_TOTAL_SEATS = new Date("2024-09-30");

// Version courante du reglement intérieur, au format date, cela permet de vérifier si un jeune doit le revalider avant son départ en séjour.
const REGLEMENT_INTERIEUR_VERSION = "2024-10-20";

const PHASE2_TOTAL_HOURS = 84;

const INSCRIPTION_GOAL_LEVELS = {
  DEPARTEMENTAL: "departemental",
  REGIONAL: "regional",
} as const;

const CLE_TYPE_LIST = Object.values(CLE_TYPE);
const CLE_SECTOR_LIST = Object.values(CLE_SECTOR);
const CLE_GRADE_LIST = Object.values(CLE_GRADE);
const STATUS_CLASSE_LIST = Object.values(STATUS_CLASSE);
const STATUS_PHASE1_CLASSE_LIST = Object.values(STATUS_PHASE1_CLASSE);
const YOUNG_SOURCE_LIST = Object.values(YOUNG_SOURCE);
const COHORT_TYPE_LIST = Object.values(COHORT_TYPE);
const COHORT_STATUS_LIST = Object.values(COHORT_STATUS);
const CLE_COLORATION_LIST = Object.values(CLE_COLORATION);
const CLE_FILIERE_LIST = Object.values(CLE_FILIERE);
const TYPE_CLASSE_LIST = Object.values(TYPE_CLASSE);

const PLAN_MARKETING_FOLDER_PATH_EXPORT = "plan-marketing";

export {
  YOUNG_STATUS,
  YOUNG_STATUS_LIST,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE1_MOTIF,
  YOUNG_STATUS_PHASE2,
  CONTRACT_STATUS,
  YOUNG_STATUS_PHASE3,
  YOUNG_PHASE,
  PHASE_STATUS,
  SESSION_STATUS,
  APPLICATION_STATUS,
  EQUIVALENCE_STATUS,
  PROFESSIONNAL_PROJECT,
  PROFESSIONNAL_PROJECT_PRECISION,
  MISSION_DOMAINS,
  JVA_MISSION_DOMAINS,
  YOUNG_SITUATIONS,
  FORMAT,
  MISSION_STATUS,
  PERIOD,
  TRANSPORT,
  MISSION_PERIOD_DURING_HOLIDAYS,
  MISSION_PERIOD_DURING_SCHOOL,
  STRUCTURE_STATUS,
  DEFAULT_STRUCTURE_NAME,
  INTEREST_MISSION_LIMIT_DATE,
  ES_NO_LIMIT,
  SENDINBLUE_SMS,
  WITHRAWN_REASONS,
  CONSENTMENT_TEXTS,
  FILE_STATUS_PHASE1,
  MINISTRES,
  FILE_KEYS,
  MILITARY_FILE_KEYS,
  MILITARY_PREPARATION_FILES_STATUS,
  SESSION_FILE_KEYS,
  ENGAGEMENT_TYPES,
  UNSS_TYPE,
  ENGAGEMENT_LYCEEN_TYPES,
  GRADES,
  TEMPLATE_DESCRIPTIONS,
  MIME_TYPES,
  YOUNG_SCHOOLED_SITUATIONS,
  STRUCTURE_LEGAL_STATUS,
  CLE_TYPE,
  CLE_SECTOR,
  CLE_GRADE,
  STATUS_CLASSE,
  STATUS_PHASE1_CLASSE,
  YOUNG_SOURCE,
  CLE_TYPE_LIST,
  CLE_SECTOR_LIST,
  CLE_GRADE_LIST,
  TYPE_CLASSE_LIST,
  INSCRIPTION_GOAL_LEVELS,
  TYPE_CLASSE,
  STATUS_CLASSE_LIST,
  STATUS_PHASE1_CLASSE_LIST,
  YOUNG_SOURCE_LIST,
  COHORT_TYPE,
  COHORT_TYPE_LIST,
  COHORT_STATUS,
  COHORT_STATUS_LIST,
  CLE_COLORATION,
  CLE_COLORATION_LIST,
  CLE_FILIERE_LIST,
  REGLEMENT_INTERIEUR_VERSION,
  ACADEMIQUE_DOMAINS,
  LIMIT_DATE_ESTIMATED_SEATS,
  LIMIT_DATE_TOTAL_SEATS,
  PHASE2_TOTAL_HOURS,
  PLAN_MARKETING_FOLDER_PATH_EXPORT,
};
export default {
  YOUNG_STATUS,
  YOUNG_STATUS_LIST,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE1_MOTIF,
  YOUNG_STATUS_PHASE2,
  CONTRACT_STATUS,
  YOUNG_STATUS_PHASE3,
  YOUNG_PHASE,
  PHASE_STATUS,
  SESSION_STATUS,
  APPLICATION_STATUS,
  EQUIVALENCE_STATUS,
  PROFESSIONNAL_PROJECT,
  PROFESSIONNAL_PROJECT_PRECISION,
  MISSION_DOMAINS,
  JVA_MISSION_DOMAINS,
  YOUNG_SITUATIONS,
  FORMAT,
  MISSION_STATUS,
  PERIOD,
  TRANSPORT,
  MISSION_PERIOD_DURING_HOLIDAYS,
  MISSION_PERIOD_DURING_SCHOOL,
  STRUCTURE_STATUS,
  DEFAULT_STRUCTURE_NAME,
  INTEREST_MISSION_LIMIT_DATE,
  ES_NO_LIMIT,
  SENDINBLUE_SMS,
  WITHRAWN_REASONS,
  CONSENTMENT_TEXTS,
  FILE_STATUS_PHASE1,
  MINISTRES,
  FILE_KEYS,
  MILITARY_FILE_KEYS,
  MILITARY_PREPARATION_FILES_STATUS,
  SESSION_FILE_KEYS,
  ENGAGEMENT_TYPES,
  UNSS_TYPE,
  ENGAGEMENT_LYCEEN_TYPES,
  GRADES,
  TEMPLATE_DESCRIPTIONS,
  MIME_TYPES,
  YOUNG_SCHOOLED_SITUATIONS,
  STRUCTURE_LEGAL_STATUS,
  CLE_TYPE,
  CLE_SECTOR,
  CLE_GRADE,
  STATUS_CLASSE,
  INSCRIPTION_GOAL_LEVELS,
  STATUS_PHASE1_CLASSE,
  YOUNG_SOURCE,
  CLE_TYPE_LIST,
  CLE_SECTOR_LIST,
  CLE_GRADE_LIST,
  TYPE_CLASSE_LIST,
  TYPE_CLASSE,
  STATUS_CLASSE_LIST,
  STATUS_PHASE1_CLASSE_LIST,
  YOUNG_SOURCE_LIST,
  CLE_COLORATION,
  CLE_COLORATION_LIST,
  REGLEMENT_INTERIEUR_VERSION,
  ACADEMIQUE_DOMAINS,
  LIMIT_DATE_ESTIMATED_SEATS,
  LIMIT_DATE_TOTAL_SEATS,
  PHASE2_TOTAL_HOURS,
  PLAN_MARKETING_FOLDER_PATH_EXPORT,
};
