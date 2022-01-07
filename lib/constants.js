const { ROLES, SUB_ROLES } = require("./roles");

const YOUNG_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  REFUSED: "REFUSED",
  IN_PROGRESS: "IN_PROGRESS",
  WITHDRAWN: "WITHDRAWN",
  DELETED: "DELETED",
  WAITING_LIST: "WAITING_LIST",
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
};

const YOUNG_STATUS_PHASE1 = {
  WAITING_AFFECTATION: "WAITING_AFFECTATION",
  AFFECTED: "AFFECTED",
  EXEMPTED: "EXEMPTED",
  DONE: "DONE",
  NOT_DONE: "NOT_DONE",
  WITHDRAWN: "WITHDRAWN",
  WAITING_LIST: "WAITING_LIST",
};

const YOUNG_STATUS_PHASE1_MOTIF = {
  ILLNESS: "ILLNESS",
  DEATH: "DEATH",
  ADMINISTRATION_CANCEL: "ADMINISTRATION_CANCEL",
  OTHER: "OTHER",
};

const YOUNG_STATUS_PHASE2 = {
  WAITING_REALISATION: "WAITING_REALISATION",
  IN_PROGRESS: "IN_PROGRESS",
  VALIDATED: "VALIDATED",
  WITHDRAWN: "WITHDRAWN",
};

const CONTRACT_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VALIDATED: "VALIDATED",
};

const YOUNG_STATUS_PHASE3 = {
  WAITING_REALISATION: "WAITING_REALISATION",
  WAITING_VALIDATION: "WAITING_VALIDATION",
  VALIDATED: "VALIDATED",
  WITHDRAWN: "WITHDRAWN",
};

const YOUNG_PHASE = {
  INSCRIPTION: "INSCRIPTION",
  COHESION_STAY: "COHESION_STAY",
  INTEREST_MISSION: "INTEREST_MISSION",
  CONTINUE: "CONTINUE",
};

const PHASE_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  IN_COMING: "IN_COMING",
  VALIDATED: "VALIDATED",
  CANCEL: "CANCEL",
  WAITING_AFFECTATION: "WAITING_AFFECTATION",
};

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
};

const PROFESSIONNAL_PROJECT = {
  UNIFORM: "UNIFORM",
  OTHER: "OTHER",
  UNKNOWN: "UNKNOWN",
};

const PROFESSIONNAL_PROJECT_PRECISION = {
  FIREFIGHTER: "FIREFIGHTER",
  POLICE: "POLICE",
  ARMY: "ARMY",
};

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
};

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
};

const FORMAT = {
  CONTINUOUS: "CONTINUOUS",
  DISCONTINUOUS: "DISCONTINUOUS",
  AUTONOMOUS: "AUTONOMOUS",
};

const REFERENT_ROLES = ROLES;

const REFERENT_DEPARTMENT_SUBROLE = {
  manager_department: SUB_ROLES.manager_department,
  assistant_manager_department: SUB_ROLES.assistant_manager_department,
  manager_phase2: SUB_ROLES.manager_phase2,
  secretariat: SUB_ROLES.secretariat,
};
const REFERENT_REGION_SUBROLE = {
  coordinator: SUB_ROLES.coordinator,
  assistant_coordinator: SUB_ROLES.assistant_coordinator,
  manager_phase2: SUB_ROLES.manager_phase2,
};

const MISSION_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
  REFUSED: "REFUSED",
  CANCEL: "CANCEL",
  ARCHIVED: "ARCHIVED",
};

const PERIOD = {
  DURING_HOLIDAYS: "DURING_HOLIDAYS",
  DURING_SCHOOL: "DURING_SCHOOL",
};

const TRANSPORT = {
  PUBLIC_TRANSPORT: "PUBLIC_TRANSPORT",
  BIKE: "BIKE",
  MOTOR: "MOTOR",
  CARPOOLING: "CARPOOLING",
  OTHER: "OTHER",
};

const MISSION_PERIOD_DURING_HOLIDAYS = {
  SUMMER: "SUMMER",
  AUTUMN: "AUTUMN",
  DECEMBER: "DECEMBER",
  WINTER: "WINTER",
  SPRING: "SPRING",
};

const MISSION_PERIOD_DURING_SCHOOL = {
  EVENING: "EVENING",
  END_DAY: "END_DAY",
  WEEKEND: "WEEKEND",
};

const STRUCTURE_STATUS = {
  WAITING_VALIDATION: "WAITING_VALIDATION",
  WAITING_CORRECTION: "WAITING_CORRECTION",
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
};

const DEFAULT_STRUCTURE_NAME = "Ma nouvelle Structure";

const COHORTS = ['2019', '2020', '2021', '2022', 'Février 2022', 'Juin 2022', 'Juillet 2022'];

const COHESION_STAY_LIMIT_DATE = {
  2019: "du 16 au 28 juin 2019",
  2020: "Du 21 juin au 2 juillet 2021",
  2021: "Du 21 juin au 2 juillet 2021",
};

const INTEREST_MISSION_LIMIT_DATE = {
  2019: "23 mars 2021",
  2020: "31 décembre 2021",
  2021: "30 juin 2022",
};

const ES_NO_LIMIT = 10_000;

const SENDINBLUE_TEMPLATES = {
  FORGOT_PASSWORD: "157",

  invitationReferent: {
    [ROLES.REFERENT_DEPARTMENT]: "158",
    [ROLES.REFERENT_REGION]: "159",
    [ROLES.RESPONSIBLE]: "160",
    [ROLES.SUPERVISOR]: "160",
    [ROLES.ADMIN]: "161",
    [ROLES.HEAD_CENTER]: "162",
    [ROLES.VISITOR]: "286",
    NEW_STRUCTURE: "160",
    NEW_STRUCTURE_MEMBER: "163",
  },
  INVITATION_YOUNG: "166",

  // contract
  VALIDATE_CONTRACT: "176",
  REVALIDATE_CONTRACT: "175",

  referent: {
    RECAP_BI_HEBDO_DEPARTMENT: '231',
    // MIG
    MISSION_WAITING_CORRECTION: "164",
    MISSION_WAITING_VALIDATION: "194",
    NEW_MISSION: "192",
    MISSION_REFUSED: "165",
    CANCEL_APPLICATION: "155",
    ABANDON_APPLICATION: "214",
    NEW_APPLICATION_MIG: "156",
    YOUNG_VALIDATED: "173",

    MISSION_ARCHIVED: "204",
    MISSION_ARCHIVED_1_WEEK_NOTICE: "205",

    // PREPA MILITAIRE
    MILITARY_PREPARATION_DOCS_SUBMITTED: "149",
    MILITARY_PREPARATION_DOCS_VALIDATED: "148",
    NEW_MILITARY_PREPARATION_APPLICATION: "185",

    NEW_APPLICATION: "new-application",

    //PHASE 3
    VALIDATE_MISSION_PHASE3: "174",

    // Support
    ANSWER_RECEIVED: "208",
    MESSAGE_NOTIFICATION: "218",
  },
  young: {
    // le contenu est specifique a la reinscription, il faudrait faire un message plus générique a terme
    ARCHIVED: "269",

    INSCRIPTION_STARTED: "219",
    INSCRIPTION_VALIDATED: "167",
    INSCRIPTION_REACTIVATED: "168",
    INSCRIPTION_WAITING_CORRECTION: "169",
    INSCRIPTION_WAITING_LIST: "171",
    INSCRIPTION_REFUSED: "172",
    INSCRIPTION_WAITING_VALIDATION: "65",
    PHASE_1_VALIDATED: "234",
    // MIG
    REFUSE_APPLICATION: "152",
    VALIDATE_APPLICATION: "151",
    MISSION_PROPOSITION: "170",
    MISSION_CANCEL: "261",
    MISSION_ARCHIVED: "227",
    APPLICATION_CANCEL: "180", //todo
    PHASE_2_VALIDATED: "154",
    MISSION_PROPOSITION_AUTO: "237",

    // PREPA MILITAIRE
    MILITARY_PREPARATION_DOCS_VALIDATED: "145",
    MILITARY_PREPARATION_DOCS_CORRECTION: "146",
    MILITARY_PREPARATION_DOCS_REFUSED: "147",
    MILITARY_PREPARATION_DOCS_REMINDER: "201",
    MILITARY_PREPARATION_DOCS_REMINDER_RENOTIFY: "228",

    //PHASE 3
    VALIDATE_PHASE3: "200",

    DOCUMENT: "182",
    CONTRACT_VALIDATED: "183",

    // Support
    ANSWER_RECEIVED: "208",
  },
};

ZAMMAD_GROUP = {
  YOUNG: "Jeunes",
  VOLONTAIRE: "Volontaires",
  REFERENT: "Référents",
  STRUCTURE: "Structures",
  CONTACT: "Contact",
  ADMIN: "Admin",
  VISITOR: "Visiteurs"
};

WITHRAWN_REASONS=[
  {
    value:'unavailable_perso',
    label:'Non disponibilité pour motif familial ou personnel'
  },
  {
    value:'unavailable_pro',
    label:'Non disponibilité pour motif scolaire ou professionnel'
  },
  {
    value:'no_interest',
    label:"Perte d'intérêt pour le SNU"
  },
  {
    value:'bad_affectation',
    label:"L'affectation ne convient pas"
  },
  {
    value:'can_not_go_metting_point',
    label:'Impossibilité de se rendre au point de rassemblement'
  },
  {
    value:'bad_mission',
    label:"L'offre de mission ne convient pas"
  } ,
  {
    value:'other',
    label:'Autre'
  },
]

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
    "Engagement à ce que le volontaire soit à jour de ses vaccinations obligatoires, c'est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP), et pour les volontaires résidents de Guyane, la fièvre jaune."
  ],
};

module.exports = {
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE1_MOTIF,
  YOUNG_STATUS_PHASE2,
  CONTRACT_STATUS,
  YOUNG_STATUS_PHASE3,
  YOUNG_PHASE,
  PHASE_STATUS,
  APPLICATION_STATUS,
  PROFESSIONNAL_PROJECT,
  PROFESSIONNAL_PROJECT_PRECISION,
  MISSION_DOMAINS,
  YOUNG_SITUATIONS,
  FORMAT,
  ROLES,
  REFERENT_ROLES,
  REFERENT_DEPARTMENT_SUBROLE,
  REFERENT_REGION_SUBROLE,
  MISSION_STATUS,
  PERIOD,
  TRANSPORT,
  MISSION_PERIOD_DURING_HOLIDAYS,
  MISSION_PERIOD_DURING_SCHOOL,
  STRUCTURE_STATUS,
  DEFAULT_STRUCTURE_NAME,
  COHESION_STAY_LIMIT_DATE,
  INTEREST_MISSION_LIMIT_DATE,
  ES_NO_LIMIT,
  SENDINBLUE_TEMPLATES,
  ZAMMAD_GROUP,
  WITHRAWN_REASONS,
  CONSENTMENT_TEXTS,
  COHORTS,
};
