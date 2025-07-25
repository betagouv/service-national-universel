import Joi from "joi";
import { ROLES_LIST, SUB_ROLES_LIST, VISITOR_SUB_ROLES_LIST, PHONE_ZONES_NAMES_ARR, UserDto, YoungDto, SUB_ROLE_GOD } from "snu-lib";
import { isYoung } from "../utils";

// Source: https://github.com/mkg20001/joi-objectid/blob/71b2a8c0ccd31153e4efd3e7c10602b4385242f6/index.js#L12
const idRegex = /^[0-9a-fA-F]{24}$/;

export const idSchema = () => Joi.string().regex(idRegex, "id");

export function validateId(id?: string) {
  return idSchema().required().validate(id, { stripUnknown: true });
}

export function validateOptionalId(id) {
  return idSchema().optional().validate(id, { stripUnknown: true });
}

export function validateString(string) {
  return Joi.string().validate(string, { stripUnknown: true });
}

export function validateArray(array) {
  return Joi.array().items(Joi.string().allow(null, "")).validate(array, { stripUnknown: true });
}

export function validateMission(mission) {
  return Joi.object()
    .keys({
      name: Joi.string().allow(null, ""),
      domains: Joi.array().items(Joi.string().allow(null, "")),
      mainDomain: Joi.string().allow(null, ""),
      sideDomain: Joi.string().allow(null, ""),
      startAt: Joi.string().allow(null, ""),
      endAt: Joi.string().allow(null, ""),
      duration: Joi.string().allow(null, ""),
      format: Joi.string().allow(null, ""),
      frequence: Joi.string().allow(null, ""),
      period: Joi.array().items(Joi.string().allow(null, "")),
      subPeriod: Joi.array().items(Joi.string().allow(null, "")),
      placesTotal: Joi.number().allow(null),
      placesLeft: Joi.number().allow(null),
      actions: Joi.string().allow(null, ""),
      description: Joi.string().allow(null, ""),
      hebergement: Joi.string().allow(null, ""),
      hebergementPayant: Joi.string().allow(null, ""),
      justifications: Joi.string().allow(null, ""),
      contraintes: Joi.string().allow(null, ""),
      structureId: Joi.string().regex(idRegex, "id"),
      structureName: Joi.string().allow(null, ""),
      status: Joi.string().allow(null, ""),
      visibility: Joi.string().allow(null, ""),
      statusComment: Joi.string().allow(null, ""),
      tutorId: Joi.string().regex(idRegex, "id"),
      tutorName: Joi.string().allow(null, ""),
      address: Joi.string().allow(null, ""),
      zip: Joi.string().allow(null, ""),
      city: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      country: Joi.string().allow(null, ""),
      location: Joi.object()
        .keys({
          lat: Joi.number().allow(null),
          lon: Joi.number().allow(null),
        })
        .allow(null, ""),
      addressVerified: Joi.string().allow(null, ""),
      remote: Joi.string().allow(null, ""),
      isMilitaryPreparation: Joi.string().allow(null, ""),
    })
    .validate(mission, { stripUnknown: true });
}

export function validateStructure(structure) {
  return Joi.object()
    .keys({
      name: Joi.string().allow(null, ""),
      siret: Joi.string().allow(null, ""),
      description: Joi.string().allow(null, ""),
      website: Joi.string().allow(null, ""),
      facebook: Joi.string().allow(null, ""),
      twitter: Joi.string().allow(null, ""),
      instagram: Joi.string().allow(null, ""),
      status: Joi.string().allow(null, ""),
      isNetwork: Joi.string().allow(null, ""),
      networkId: Joi.string().allow(null, ""),
      networkName: Joi.string().allow(null, ""),
      legalStatus: Joi.string().allow(null, ""),
      types: Joi.array().items(Joi.string().allow(null, "")),
      sousType: Joi.string().allow(null, ""),
      associationTypes: Joi.array().items(Joi.string().allow(null, "")),
      structurePubliqueType: Joi.string().allow(null, ""),
      structurePubliqueEtatType: Joi.string().allow(null, ""),
      structurePriveeType: Joi.string().allow(null, ""),
      address: Joi.string().allow(null, ""),
      zip: Joi.string().allow(null, ""),
      city: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      country: Joi.string().allow(null, ""),
      location: Joi.object().keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      }),
      addressVerified: Joi.boolean().allow(null),
      state: Joi.string().allow(null, ""),
      isMilitaryPreparation: Joi.string().allow(null, ""),
    })
    .validate(structure, { stripUnknown: true });
}

export function validateProgram(program) {
  return Joi.object()
    .keys({
      name: Joi.string().allow(null, ""),
      description: Joi.string().allow(null, ""),
      descriptionFor: Joi.string().allow(null, ""),
      descriptionMoney: Joi.string().allow(null, ""),
      descriptionDuration: Joi.string().allow(null, ""),
      url: Joi.string()
        .uri({ scheme: ["http", "https"] })
        .allow(null, ""),
      imageFile: Joi.string().allow(null, ""),
      imageString: Joi.string().allow(null, ""),
      type: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      visibility: Joi.string().allow(null, ""),
      order: Joi.number().allow(null),
    })
    .validate(program, { stripUnknown: true });
}

export function validateContract(program) {
  return Joi.object()
    .keys({
      youngId: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
      applicationId: Joi.string().allow(null, ""),
      missionId: Joi.string().allow(null, ""),
      tutorFirstName: Joi.string().allow(null, ""),
      tutorLastName: Joi.string().allow(null, ""),
      isYoungAdult: Joi.string().allow(null, ""),
      parent1Token: Joi.string().allow(null, ""),
      projectManagerToken: Joi.string().allow(null, ""),
      structureManagerToken: Joi.string().allow(null, ""),
      parent2Token: Joi.string().allow(null, ""),
      youngContractToken: Joi.string().allow(null, ""),
      parent1Status: Joi.string().allow(null, ""),
      projectManagerStatus: Joi.string().allow(null, ""),
      structureManagerStatus: Joi.string().allow(null, ""),
      parent2Status: Joi.string().allow(null, ""),
      youngContractStatus: Joi.string().allow(null, ""),
      invitationSent: Joi.string().allow(null, ""),
      youngFirstName: Joi.string().allow(null, ""),
      youngLastName: Joi.string().allow(null, ""),
      youngBirthdate: Joi.string().allow(null, ""),
      youngAddress: Joi.string().allow(null, ""),
      youngCity: Joi.string().allow(null, ""),
      youngDepartment: Joi.string().allow(null, ""),
      youngEmail: Joi.string().email().allow(null, ""),
      youngPhone: Joi.string().allow(null, ""),
      parent1FirstName: Joi.string().allow(null, ""),
      parent1LastName: Joi.string().allow(null, ""),
      parent1Address: Joi.string().allow(null, ""),
      parent1City: Joi.string().allow(null, ""),
      parent1Department: Joi.string().allow(null, ""),
      parent1Phone: Joi.string().allow(null, ""),
      parent1Email: Joi.string().email().allow(null, ""),
      parent2FirstName: Joi.string().allow(null, ""),
      parent2LastName: Joi.string().allow(null, ""),
      parent2Address: Joi.string().allow(null, ""),
      parent2City: Joi.string().allow(null, ""),
      parent2Department: Joi.string().allow(null, ""),
      parent2Phone: Joi.string().allow(null, ""),
      parent2Email: Joi.string().email().allow(null, ""),
      missionName: Joi.string().allow(null, ""),
      missionObjective: Joi.string().allow(null, ""),
      missionAction: Joi.string().allow(null, ""),
      missionStartAt: Joi.string().allow(null, ""),
      missionEndAt: Joi.string().allow(null, ""),
      missionAddress: Joi.string().allow(null, ""),
      missionCity: Joi.string().allow(null, ""),
      missionZip: Joi.string().allow(null, ""),
      missionDuration: Joi.string().allow(null, ""),
      missionFrequence: Joi.string().allow(null, ""),
      date: Joi.string().allow(null, ""),
      projectManagerFirstName: Joi.string().allow(null, ""),
      projectManagerLastName: Joi.string().allow(null, ""),
      projectManagerRole: Joi.string().allow(null, ""),
      projectManagerEmail: Joi.string().email().allow(null, ""),
      structureManagerFirstName: Joi.string().allow(null, ""),
      structureManagerLastName: Joi.string().allow(null, ""),
      structureManagerRole: Joi.string().allow(null, ""),
      structureManagerEmail: Joi.string().email().allow(null, ""),
      structureSiret: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      sendMessage: Joi.boolean().allow(null),
    })
    .validate(program, { stripUnknown: true });
}

export function validateFirstName() {
  const formatPart = (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();

  return Joi.string().custom((value) =>
    value
      ? value.replace(/(?<=^|\s)\S+/g, (txt) => {
          const parts = txt.split("-");
          return parts.length > 1 ? parts.map(formatPart).join("-") : formatPart(txt);
        })
      : null,
  );
}

const applicationKeys = {
  youngId: Joi.string().allow(null, ""),
  youngFirstName: Joi.string().allow(null, ""),
  youngLastName: Joi.string().allow(null, ""),
  youngEmail: Joi.string().allow(null, ""),
  youngBirthdateAt: Joi.string().allow(null, ""),
  youngCity: Joi.string().allow(null, ""),
  youngDepartment: Joi.string().allow(null, ""),
  youngCohort: Joi.string().allow(null, ""),
  missionId: Joi.string().allow(null, ""),
  missionName: Joi.string().allow(null, ""),
  missionDepartment: Joi.string().allow(null, ""),
  missionRegion: Joi.string().allow(null, ""),
  missionDuration: Joi.string().allow(null, ""),
  structureId: Joi.string().allow(null, ""),
  tutorId: Joi.string().allow(null, ""),
  tutorName: Joi.string().allow(null, ""),
  contractId: Joi.string().allow(null, ""),
  priority: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
  hidden: Joi.string().allow(null, ""),
  status: Joi.string().allow(null, ""),
  statusComment: Joi.string().allow(null, ""),
};

export function validateUpdateApplication(application, user) {
  return Joi.object()
    .keys({
      ...applicationKeys,
      // A young can only update a mission for him/herself.
      youngId: isYoung(user) ? Joi.string().equal(user._id.toString()).allow(null, "") : Joi.string().allow(null, ""),
      _id: Joi.string().required(),
    })
    .validate(application, { stripUnknown: true });
}

export function validateNewApplication(application, user) {
  return Joi.object()
    .keys({
      ...applicationKeys,
      // A young can only apply to a mission for him/herself.
      youngId: isYoung(user) ? Joi.string().equal(user._id.toString()).required() : Joi.string().required(),
      missionId: Joi.string().required(),
    })
    .validate(application, { stripUnknown: true });
}

const cohesionCenterKeys = () => {
  let data = {
    name: Joi.string().allow(null, ""),
    code: Joi.string().allow(null, ""),
    code2022: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    COR: Joi.string().allow(null, ""),
    departmentCode: Joi.string().allow(null, ""),
    address: Joi.string().allow(null, ""),
    city: Joi.string().allow(null, ""),
    zip: Joi.string().allow(null, ""),
    department: Joi.string().allow(null, ""),
    region: Joi.string().allow(null, ""),
    addressVerified: Joi.string().allow(null, ""),
    placesTotal: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
    placesLeft: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
    outfitDelivered: Joi.string().allow(null, ""),
    observations: Joi.string().allow(null, ""),
    waitingList: Joi.array().items(Joi.string().allow(null, "")),
    pmr: Joi.string().allow(null, ""),
    cohorts: Joi.array().items(Joi.string().allow(null, "")),
    sessionStatus: Joi.array().items(Joi.string().allow(null, "")),
    dynamicCohort: Joi.object(),
  };
  return data;
};

export function validateNewCohesionCenter(application) {
  return Joi.object().keys(cohesionCenterKeys()).validate(application, { stripUnknown: true });
}

export function validateUpdateCohesionCenter(application) {
  return Joi.object().keys(cohesionCenterKeys()).validate(application, { stripUnknown: true });
}

const sessionPhase1Keys = {
  cohesionCenterId: Joi.string().allow(null, ""),
  headCenterId: Joi.string().allow(null, ""),
  cohort: Joi.string().allow(null, ""),
  userId: Joi.string().allow(null, ""),
  team: Joi.array().items(Joi.any().allow(null, "")),
  waitingList: Joi.array().items(Joi.string().allow(null, "")),
  placesTotal: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
  placesLeft: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
  dateStart: Joi.date().allow(null),
  dateEnd: Joi.date().allow(null),
  sanitaryContactEmail: Joi.string().allow(null, ""),
};

export function validateSessionPhase1(session) {
  return Joi.object().keys(sessionPhase1Keys).validate(session, { stripUnknown: true });
}

export function validateYoung(young: YoungDto, user?: UserDto) {
  const keys = {
    firstName: Joi.string().allow(null, ""),
    lastName: Joi.string().allow(null, ""),
    frenchNationality: Joi.string().allow(null, ""),
    birthCountry: Joi.string().allow(null, ""),
    birthCity: Joi.string().allow(null, ""),
    birthCityZip: Joi.string().allow(null, ""),
    email: Joi.string().lowercase().trim().email().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    phoneZone: Joi.string()
      .trim()
      .valid(...PHONE_ZONES_NAMES_ARR)
      .allow("", null),
    gender: Joi.string().allow(null, ""),
    birthdateAt: Joi.string().allow(null, ""),
    cohort: Joi.string().allow(null, ""),
    cohortId: Joi.string().allow(null, ""),
    parentStatementOfHonorInvalidId: Joi.string().allow(null, ""),
    originalCohort: Joi.string().allow(null, ""),
    cohortChangeReason: Joi.string().allow(null, ""),
    cohortDetailedChangeReason: Joi.string().allow(null, ""),
    phase: Joi.string().allow(null, ""),
    status: Joi.string().allow(null, ""),
    statusPhase1: Joi.string().allow(null, ""),
    statusPhase1Motif: Joi.string().allow(null, ""),
    statusPhase1MotifDetail: Joi.string().allow(null, ""),
    statusPhase2: Joi.string().allow(null, ""),
    statusPhase2UpdatedAt: Joi.string().allow(null, ""),
    statusPhase2ValidatedAt: Joi.string().allow(null, ""),
    statusPhase2Contract: Joi.array().items(Joi.string().allow(null, "")),
    statusPhase3: Joi.string().allow(null, ""),
    statusPhase3UpdatedAt: Joi.string().allow(null, ""),
    statusPhase3ValidatedAt: Joi.string().allow(null, ""),
    lastStatusAt: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
    withdrawnReason: Joi.string().allow(null, ""),
    withdrawnMessage: Joi.string().allow(null, ""),
    inscriptionCorrectionMessage: Joi.string().allow(null, ""),
    inscriptionRefusedMessage: Joi.string().allow(null, ""),
    inscriptionStep: Joi.string().allow(null, ""),
    cohesion2020Step: Joi.string().allow(null, ""),
    historic: Joi.array().items(Joi.any().allow(null, "")),
    lastLoginAt: Joi.string().allow(null, ""),
    forgotPasswordResetToken: Joi.string().allow(null, ""),
    forgotPasswordResetExpires: Joi.string().allow(null, ""),
    invitationToken: Joi.string().allow(null, ""),
    invitationExpires: Joi.string().allow(null, ""),
    cniFiles: Joi.array().items(Joi.string().allow(null, "")),
    acceptCGU: Joi.string().allow(null, ""),
    acceptRI: Joi.string().allow(null, ""),
    cohesionStayPresence: Joi.string().allow(null, ""),
    presenceJDM: Joi.string().allow(null, ""),
    departSejourAt: Joi.string().allow(null, ""),
    departSejourMotif: Joi.string().allow(null, ""),
    departSejourMotifComment: Joi.string().allow(null, ""),
    cohesionStayMedicalFileReceived: Joi.string().allow(null, ""),
    sessionPhase1Id: Joi.string().allow(null, ""),
    cohesionCenterId: Joi.string().allow(null, ""),
    cohesionCenterName: Joi.string().allow(null, ""),
    cohesionCenterZip: Joi.string().allow(null, ""),
    cohesionCenterCity: Joi.string().allow(null, ""),
    autoAffectationPhase1ExpiresAt: Joi.string().allow(null, ""),
    meetingPointId: Joi.string().allow(null, ""),
    deplacementPhase1Autonomous: Joi.string().allow(null, ""),
    phase2ApplicationStatus: Joi.array().items(Joi.string().allow(null, "")),
    phase2NumberHoursDone: Joi.string().allow(null, ""),
    phase2NumberHoursEstimated: Joi.string().allow(null, ""),
    phase3StructureName: Joi.string().allow(null, ""),
    phase3MissionDomain: Joi.string().allow(null, ""),
    phase3MissionDescription: Joi.string().allow(null, ""),
    phase3MissionStartAt: Joi.string().allow(null, ""),
    phase3MissionEndAt: Joi.string().allow(null, ""),
    phase3TutorFirstName: Joi.string().allow(null, ""),
    phase3TutorLastName: Joi.string().allow(null, ""),
    phase3TutorEmail: Joi.string().allow(null, ""),
    phase3TutorPhone: Joi.string().allow(null, ""),
    phase3TutorNote: Joi.string().allow(null, ""),
    phase3Token: Joi.string().allow(null, ""),
    address: Joi.string().allow(null, ""),
    complementAddress: Joi.string().allow(null, ""),
    addressVerified: Joi.string().allow(null, ""),
    zip: Joi.string().allow(null, ""),
    city: Joi.string().allow(null, ""),
    cityCode: Joi.string().allow(null, ""),
    populationDensity: Joi.string().allow(null, ""),
    isRegionRural: Joi.string().allow(null, ""),
    department: Joi.string().allow(null, ""),
    region: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    location: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    qpv: Joi.string().allow(null, ""),
    foreignAddress: Joi.string().allow(null, ""),
    foreignCity: Joi.string().allow(null, ""),
    foreignZip: Joi.string().allow(null, ""),
    foreignCountry: Joi.string().allow(null, ""),
    hostFirstName: Joi.string().allow(null, ""),
    hostLastName: Joi.string().allow(null, ""),
    hostRelationship: Joi.string().allow(null, ""),
    hostCity: Joi.string().allow(null, ""),
    hostZip: Joi.string().allow(null, ""),
    hostAddress: Joi.string().allow(null, ""),
    hostDepartment: Joi.string().allow(null, ""),
    hostRegion: Joi.string().allow(null, ""),
    situation: Joi.string().allow(null, ""),
    grade: Joi.string().allow(null, ""),
    schoolCertification: Joi.string().allow(null, ""),
    schooled: Joi.string().allow(null, ""),
    schoolName: Joi.string().allow(null, ""),
    schoolType: Joi.string().allow(null, ""),
    schoolAddress: Joi.string().allow(null, ""),
    schoolComplementAdresse: Joi.string().allow(null, ""),
    schoolZip: Joi.string().allow(null, ""),
    schoolCity: Joi.string().allow(null, ""),
    schoolDepartment: Joi.string().allow(null, ""),
    schoolRegion: Joi.string().allow(null, ""),
    schoolCountry: Joi.string().allow(null, ""),
    schoolLocation: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    schoolId: Joi.string().allow(null, ""),
    academy: Joi.string().allow(null, ""),
    employed: Joi.string().allow(null, ""),
    parentAllowSNU: Joi.string().allow(null, ""),
    parent1Status: Joi.string().allow(null, ""),
    parent1FirstName: Joi.string().allow(null, ""),
    parent1LastName: Joi.string().allow(null, ""),
    parent1Email: Joi.string().allow(null, ""),
    parent1AllowSNU: Joi.string().allow(null, ""),
    parent1Phone: Joi.string().allow(null, ""),
    parent1PhoneZone: Joi.string()
      .trim()
      .valid(...PHONE_ZONES_NAMES_ARR)
      .allow(null, ""),
    parent1OwnAddress: Joi.string().allow(null, ""),
    parent1Address: Joi.string().allow(null, ""),
    parent1ComplementAddress: Joi.string().allow(null, ""),
    parent1AllowImageRights: Joi.string().allow(null, ""),
    parent1Zip: Joi.string().allow(null, ""),
    parent1City: Joi.string().allow(null, ""),
    parent1Department: Joi.string().allow(null, ""),
    parent1Region: Joi.string().allow(null, ""),
    parent1Country: Joi.string().allow(null, ""),
    parent1Location: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    parent1FromFranceConnect: Joi.string().allow(null, ""),
    parent2Status: Joi.string().allow(null, ""),
    parent2AllowSNU: Joi.string().allow(null, ""),
    parent2FirstName: Joi.string().allow(null, ""),
    parent2LastName: Joi.string().allow(null, ""),
    parent2Email: Joi.string().allow(null, ""),
    parent2Phone: Joi.string().allow(null, ""),
    parent2PhoneZone: Joi.string()
      .trim()
      .valid(...PHONE_ZONES_NAMES_ARR)
      .allow(null, ""),
    parent2OwnAddress: Joi.string().allow(null, ""),
    parent2Address: Joi.string().allow(null, ""),
    parent2ComplementAddress: Joi.string().allow(null, ""),
    parent2AllowImageRights: Joi.string().allow(null, ""),
    parent2Zip: Joi.string().allow(null, ""),
    parent2City: Joi.string().allow(null, ""),
    parent2Department: Joi.string().allow(null, ""),
    parent2Region: Joi.string().allow(null, ""),
    parent2Country: Joi.string().allow(null, ""),
    parent2Location: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    parent2FromFranceConnect: Joi.string().allow(null, ""),
    allergies: Joi.string().allow(null, ""),
    handicap: Joi.string().allow(null, ""),
    handicapInSameDepartment: Joi.string().allow(null, ""),
    reducedMobilityAccess: Joi.string().allow(null, ""),
    ppsBeneficiary: Joi.string().allow(null, ""),
    paiBeneficiary: Joi.string().allow(null, ""),
    medicosocialStructure: Joi.string().allow(null, ""),
    medicosocialStructureName: Joi.string().allow(null, ""),
    medicosocialStructureAddress: Joi.string().allow(null, ""),
    medicosocialStructureComplementAddress: Joi.string().allow(null, ""),
    medicosocialStructureZip: Joi.string().allow(null, ""),
    medicosocialStructureCity: Joi.string().allow(null, ""),
    medicosocialStructureDepartment: Joi.string().allow(null, ""),
    medicosocialStructureRegion: Joi.string().allow(null, ""),
    medicosocialStructureLocation: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    engagedStructure: Joi.string().allow(null, ""),
    specificAmenagment: Joi.string().allow(null, ""),
    specificAmenagmentType: Joi.string().allow(null, ""),
    highSkilledActivity: Joi.string().allow(null, ""),
    highSkilledActivityInSameDepartment: Joi.string().allow(null, ""),
    highSkilledActivityType: Joi.string().allow(null, ""),
    highSkilledActivityProofFiles: Joi.array().items(Joi.string().allow(null, "")),
    dataProcessingConsentmentFiles: Joi.array().items(Joi.string().allow(null, "")),
    parentConsentment: Joi.string().allow(null, ""),
    parentConsentmentFiles: Joi.array().items(Joi.string().allow(null, "")),
    parentConsentmentFilesCompliant: Joi.string().allow(null, ""),
    parentConsentmentFilesCompliantInfo: Joi.string().allow(null, ""),
    consentment: Joi.string().allow(null, ""),
    imageRight: Joi.string().allow(null, ""),
    imageRightFiles: Joi.array().items(Joi.string().allow(null, "")),
    autoTestPCR: Joi.string().allow(null, ""),
    autoTestPCRFiles: Joi.array().items(Joi.string().allow(null, "")),
    rulesYoung: Joi.string().allow(null, ""),
    rulesParent1: Joi.string().allow(null, ""),
    rulesParent2: Joi.string().allow(null, ""),
    rulesFiles: Joi.array().items(Joi.string().allow(null, "")),
    informationAccuracy: Joi.string().allow(null, ""),
    aknowledgmentTerminaleSessionAvailability: Joi.string().allow(null, ""),
    jdc: Joi.string().allow(null, ""),
    motivations: Joi.string().allow(null, ""),
    domains: Joi.array().items(Joi.string().allow(null, "")),
    professionnalProject: Joi.string().allow(null, ""),
    professionnalProjectPrecision: Joi.string().allow(null, ""),
    period: Joi.string().allow(null, ""),
    periodRanking: Joi.array().items(Joi.string().allow(null, "")),
    mobilityNearSchool: Joi.string().allow(null, ""),
    mobilityNearHome: Joi.string().allow(null, ""),
    mobilityNearRelative: Joi.string().allow(null, ""),
    mobilityNearRelativeName: Joi.string().allow(null, ""),
    mobilityNearRelativeAddress: Joi.string().allow(null, ""),
    mobilityNearRelativeZip: Joi.string().allow(null, ""),
    mobilityNearRelativeCity: Joi.string().allow(null, ""),
    mobilityTransport: Joi.array().items(Joi.string().allow(null, "")),
    mobilityTransportOther: Joi.string().allow(null, ""),
    missionFormat: Joi.string().allow(null, ""),
    engaged: Joi.string().allow(null, ""),
    engagedDescription: Joi.string().allow(null, ""),
    desiredLocation: Joi.string().allow(null, ""),
    defenseInterest: Joi.string().allow(null, ""),
    defenseTypeInterest: Joi.string().allow(null, ""),
    defenseDomainInterest: Joi.string().allow(null, ""),
    defenseMotivationInterest: Joi.string().allow(null, ""),
    securityInterest: Joi.string().allow(null, ""),
    securityDomainInterest: Joi.string().allow(null, ""),
    solidarityInterest: Joi.string().allow(null, ""),
    healthInterest: Joi.string().allow(null, ""),
    educationInterest: Joi.string().allow(null, ""),
    cultureInterest: Joi.string().allow(null, ""),
    sportInterest: Joi.string().allow(null, ""),
    environmentInterest: Joi.string().allow(null, ""),
    citizenshipInterest: Joi.string().allow(null, ""),
    militaryPreparationFilesIdentity: Joi.array().items(Joi.string().allow(null, "")),
    militaryPreparationFilesCensus: Joi.array().items(Joi.string().allow(null, "")),
    militaryPreparationFilesAuthorization: Joi.array().items(Joi.string().allow(null, "")),
    militaryPreparationFilesCertificate: Joi.array().items(Joi.string().allow(null, "")),
    statusMilitaryPreparationFiles: Joi.string().allow(null, ""),
    militaryPreparationCorrectionMessage: Joi.string().allow(null, ""),
    missionsInMail: Joi.array().items(Joi.any().allow(null, "")),
    classeId: Joi.string().allow(null, ""),
    psc1Info: Joi.string().allow(null, ""),
    roadCodeRefund: Joi.string().valid("true", "false").allow(null, ""),
  };

  if (!isYoung(user)) {
    // @ts-ignore
    keys.password = Joi.string().allow(null, "");
  }

  return Joi.object().keys(keys).validate(young, { stripUnknown: true });
}

export function validateDepartmentService(departmentService) {
  return Joi.object()
    .keys({
      contacts: Joi.array().items(Joi.any().allow(null, "")),
      department: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      directionName: Joi.string().allow(null, ""),
      serviceName: Joi.string().allow(null, ""),
      serviceNumber: Joi.string().allow(null, ""),
      address: Joi.string().allow(null, ""),
      complementAddress: Joi.string().allow(null, ""),
      zip: Joi.string().allow(null, ""),
      city: Joi.string().allow(null, ""),
      description: Joi.string().allow(null, ""),
    })
    .validate(departmentService, { stripUnknown: true });
}
export function validateWaitingList(waitingList) {
  return Joi.object()
    .keys({
      zip: Joi.string().allow(null, ""),
      mail: Joi.string().allow(null, ""),
      birthdateAt: Joi.string().allow(null, ""),
    })
    .validate(waitingList, { stripUnknown: true });
}

export function validateReferent(referent) {
  return Joi.object()
    .keys({
      firstName: validateFirstName().allow(null, ""),
      lastName: Joi.string().uppercase().allow(null, ""),
      email: Joi.string().lowercase().trim().email().allow(null, ""),
      password: Joi.string().allow(null, ""),
      forgotPasswordResetToken: Joi.string().allow(null, ""),
      invitationToken: Joi.string().allow(null, ""),
      role: Joi.string()
        .allow(null)
        .valid(...ROLES_LIST),
      region: Joi.string().allow(null, ""),
      department: Joi.array().items(Joi.string().allow(null, "")).allow(null, ""),
      subRole: Joi.string()
        .allow(null, "")
        .valid(...SUB_ROLES_LIST, ...VISITOR_SUB_ROLES_LIST),
      sessionPhase1Id: Joi.string().allow(null, ""),
      cohesionCenterId: Joi.string().allow(null, ""),
      cohesionCenterName: Joi.string().allow(null, ""),
      phone: Joi.string().allow(null, ""),
      mobile: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
      acceptCGU: Joi.string().allow(null, ""),
      cohorts: Joi.array().items(Joi.string().allow(null, "")),
    })
    .validate(referent, { stripUnknown: true });
}

export function validateEvent(event) {
  return Joi.object()
    .keys({
      category: Joi.string().allow(null, ""),
      action: Joi.string().allow(null, ""),
      value: Joi.string().allow(null, ""),
    })
    .validate(event, { stripUnknown: true });
}

export function validateSelf(referent) {
  // Referents can not update their role.
  return Joi.object()
    .keys({
      firstName: validateFirstName().allow(null, ""),
      lastName: Joi.string().uppercase().allow(null, ""),
      email: Joi.string().lowercase().trim().email().allow(null, ""),
      password: Joi.string().allow(null, ""),
      subRole: Joi.string()
        .allow(null, "")
        .valid(...[...SUB_ROLES_LIST, ...VISITOR_SUB_ROLES_LIST, SUB_ROLE_GOD]),
      phone: Joi.string().allow(null, ""),
      mobile: Joi.string().allow(null, ""),
    })
    .validate(referent, { stripUnknown: true });
}

export function validatePhase1Document(phase1document, key) {
  switch (key) {
    case "imageRight":
      return Joi.object({
        imageRight: Joi.string().trim().required().valid("true", "false"),
        imageRightFiles: Joi.array().items(Joi.string().required()).required().min(1),
      }).validate(phase1document);
    case "rules":
      return Joi.object({
        rulesYoung: Joi.string().trim().required().valid("true"),
      }).validate(phase1document);
    case "agreement":
      return Joi.object({
        youngPhase1Agreement: Joi.string().trim().required().valid("true"),
      }).validate(phase1document);
    case "cohesionStayMedical":
      return Joi.object({
        cohesionStayMedicalFileDownload: Joi.string().trim().required().valid("true"),
      }).validate(phase1document);
    case "convocation":
      return Joi.object({
        convocationFileDownload: Joi.string().trim().required().valid("true"),
      }).validate(phase1document);
    default:
      return { value: null, error: { key: "unknow " + key } };
  }
}

export function validatePhase2Preference(preferences) {
  return Joi.object()
    .keys({
      professionnalProject: Joi.string().allow(null, ""),
      professionnalProjectPrecision: Joi.string().allow(null, ""),
      engaged: Joi.string().allow(null, ""),
      desiredLocation: Joi.string().allow(null, ""),
      engagedDescription: Joi.string().allow(null, ""),
      domains: Joi.array().items(Joi.string().allow(null, "")).allow(null, ""),
      missionFormat: Joi.string().allow(null, ""),
      mobilityTransport: Joi.array().items(Joi.string().allow(null, "")).allow(null, ""),
      period: Joi.string().allow(null, ""),
      mobilityTransportOther: Joi.string().allow(null, ""),
      mobilityNearHome: Joi.string().allow(null, ""),
      mobilityNearSchool: Joi.string().allow(null, ""),
      mobilityNearRelative: Joi.string().allow(null, ""),
      mobilityNearRelativeName: Joi.string().allow(null, ""),
      mobilityNearRelativeAddress: Joi.string().allow(null, ""),
      mobilityNearRelativeZip: Joi.string().allow(null, ""),
      mobilityNearRelativeCity: Joi.string().allow(null, ""),
      periodRanking: Joi.array().items(Joi.string().allow(null, "")).allow(null, ""),
    })
    .validate(preferences, { stripUnknown: true });
}

export function validateStructureManager(structureManager) {
  return Joi.object()
    .keys({
      firstName: validateFirstName().required(),
      lastName: Joi.string().uppercase().required(),
      mobile: Joi.string().required(),
      email: Joi.string().lowercase().trim().email().required(),
      role: Joi.string().allow(null, ""),
    })
    .validate(structureManager, { stripUnknown: true });
}

export function validateHeadOfCenterCohortChange(values) {
  return Joi.object()
    .keys({
      cohesionCenterId: Joi.string().regex(idRegex, "id").required(),
      headCenterId: Joi.string().regex(idRegex, "id").required(),
      oldCohort: Joi.string().required(),
      newCohort: Joi.string().required(),
    })
    .validate(values, { stripUnknown: true });
}

export const representantSchema = (isRequired) => {
  return {
    parent1Status: needRequired(Joi.string().trim().valid("father", "mother", "representant"), isRequired),
    parent1FirstName: needRequired(validateFirstName().trim(), isRequired),
    parent1LastName: needRequired(Joi.string().trim(), isRequired),
    parent1Email: needRequired(Joi.string().trim().lowercase().email(), isRequired),
    parent1Phone: needRequired(Joi.string().trim(), isRequired),
    parent1PhoneZone: needRequired(
      Joi.string()
        .trim()
        .valid(...PHONE_ZONES_NAMES_ARR),
      isRequired,
    ),
    parent2: needRequired(Joi.string().trim().valid(true, false), isRequired),
    parent2Status: Joi.alternatives().conditional("parent2", {
      is: true,
      then: needRequired(Joi.string().trim().valid("father", "mother", "representant"), isRequired),
      otherwise: Joi.allow(null),
    }),
    parent2FirstName: Joi.alternatives().conditional("parent2", { is: true, then: needRequired(validateFirstName().trim(), isRequired), otherwise: Joi.allow(null) }),
    parent2LastName: Joi.alternatives().conditional("parent2", {
      is: true,
      then: needRequired(Joi.string().uppercase().trim(), isRequired),
      otherwise: Joi.allow(null),
    }),
    parent2Email: Joi.alternatives().conditional("parent2", {
      is: true,
      then: needRequired(Joi.string().trim().lowercase().email(), isRequired),
      otherwise: Joi.allow(null),
    }),
    parent2Phone: Joi.alternatives().conditional("parent2", {
      is: true,
      then: needRequired(Joi.string().trim(), isRequired),
      otherwise: Joi.allow(null),
    }),

    parent2PhoneZone: Joi.alternatives().conditional("parent2", {
      is: true,
      then: needRequired(
        Joi.string()
          .trim()
          .valid(...PHONE_ZONES_NAMES_ARR),
        isRequired,
      ),
      otherwise: Joi.allow(null),
    }),
  };
};

export function validateParents(values, isRequired) {
  return Joi.object(representantSchema(isRequired)).validate(values, { stripUnknown: true });
}

export const needRequired = (joi, isRequired) => {
  if (isRequired) return joi.required();
  else return joi.allow(null, "");
};
