const Joi = require("joi");
const { ROLES_LIST, SUB_ROLES_LIST } = require("snu-lib/roles");
const { isYoung } = require("../utils");

// Source: https://github.com/mkg20001/joi-objectid/blob/71b2a8c0ccd31153e4efd3e7c10602b4385242f6/index.js#L12
const idRegex = /^[0-9a-fA-F]{24}$/;

function validateId(id) {
  return Joi.string().regex(idRegex, "id").required().validate(id, { stripUnknown: true });
}

function validateOptionalId(id) {
  return Joi.string().regex(idRegex, "id").optional().validate(id, { stripUnknown: true });
}

function validateString(string) {
  return Joi.string().validate(string, { stripUnknown: true });
}

function validateMission(mission) {
  return Joi.object()
    .keys({
      name: Joi.string().allow(null, ""),
      domains: Joi.array().items(Joi.string().allow(null, "")),
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
      justifications: Joi.string().allow(null, ""),
      contraintes: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      status: Joi.string().allow(null, ""),
      statusComment: Joi.string().allow(null, ""),
      tutorId: Joi.string().allow(null, ""),
      tutorName: Joi.string().allow(null, ""),
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
      remote: Joi.string().allow(null, ""),
      isMilitaryPreparation: Joi.string().allow(null, ""),
    })
    .validate(mission, { stripUnknown: true });
}

function validateStructure(structure) {
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
      state: Joi.string().allow(null, ""),
      isMilitaryPreparation: Joi.string().allow(null, ""),
    })
    .validate(structure, { stripUnknown: true });
}

function validateProgram(program) {
  return Joi.object()
    .keys({
      name: Joi.string().allow(null, ""),
      description: Joi.string().allow(null, ""),
      descriptionFor: Joi.string().allow(null, ""),
      descriptionMoney: Joi.string().allow(null, ""),
      descriptionDuration: Joi.string().allow(null, ""),
      url: Joi.string().allow(null, ""),
      imageFile: Joi.string().allow(null, ""),
      imageString: Joi.string().allow(null, ""),
      type: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      visibility: Joi.string().allow(null, ""),
    })
    .validate(program, { stripUnknown: true });
}

function validateContract(program) {
  return Joi.object()
    .keys({
      youngId: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
      applicationId: Joi.string().allow(null, ""),
      missionId: Joi.string().allow(null, ""),
      tutorId: Joi.string().allow(null, ""),
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
      youngEmail: Joi.string().allow(null, ""),
      youngPhone: Joi.string().allow(null, ""),
      parent1FirstName: Joi.string().allow(null, ""),
      parent1LastName: Joi.string().allow(null, ""),
      parent1Address: Joi.string().allow(null, ""),
      parent1City: Joi.string().allow(null, ""),
      parent1Department: Joi.string().allow(null, ""),
      parent1Phone: Joi.string().allow(null, ""),
      parent1Email: Joi.string().allow(null, ""),
      parent2FirstName: Joi.string().allow(null, ""),
      parent2LastName: Joi.string().allow(null, ""),
      parent2Address: Joi.string().allow(null, ""),
      parent2City: Joi.string().allow(null, ""),
      parent2Department: Joi.string().allow(null, ""),
      parent2Phone: Joi.string().allow(null, ""),
      parent2Email: Joi.string().allow(null, ""),
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
      projectManagerEmail: Joi.string().allow(null, ""),
      structureManagerFirstName: Joi.string().allow(null, ""),
      structureManagerLastName: Joi.string().allow(null, ""),
      structureManagerRole: Joi.string().allow(null, ""),
      structureManagerEmail: Joi.string().allow(null, ""),
      structureSiret: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      sendMessage: Joi.boolean().allow(null),
    })
    .validate(program, { stripUnknown: true });
}

function validateFirstName() {
  return Joi.string().custom((value) => (value ? value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : null));
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
  status: Joi.string().allow(null, ""),
  statusComment: Joi.string().allow(null, ""),
};

function validateUpdateApplication(application, user) {
  return Joi.object()
    .keys({
      ...applicationKeys,
      // A young can only update a mission for him/herself.
      youngId: isYoung(user) ? Joi.string().equal(user._id.toString()).allow(null, "") : Joi.string().allow(null, ""),
      _id: Joi.string().required(),
    })
    .validate(application, { stripUnknown: true });
}

function validateNewApplication(application, user) {
  return Joi.object()
    .keys({
      ...applicationKeys,
      // A young can only apply to a mission for him/herself.
      youngId: isYoung(user) ? Joi.string().equal(user._id.toString()).required() : Joi.string().required(),
      missionId: Joi.string().required(),
    })
    .validate(application, { stripUnknown: true });
}

const cohesionCenterKeys = {
  name: Joi.string().allow(null, ""),
  code: Joi.string().allow(null, ""),
  country: Joi.string().allow(null, ""),
  COR: Joi.string().allow(null, ""),
  departmentCode: Joi.string().allow(null, ""),
  address: Joi.string().allow(null, ""),
  city: Joi.string().allow(null, ""),
  zip: Joi.string().allow(null, ""),
  department: Joi.string().allow(null, ""),
  region: Joi.string().allow(null, ""),
  placesTotal: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
  placesLeft: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
  outfitDelivered: Joi.string().allow(null, ""),
  observations: Joi.string().allow(null, ""),
  waitingList: Joi.array().items(Joi.string().allow(null, "")),
};

function validateNewCohesionCenter(application) {
  return Joi.object().keys(cohesionCenterKeys).validate(application, { stripUnknown: true });
}

function validateUpdateCohesionCenter(application) {
  return Joi.object()
    .keys({ ...cohesionCenterKeys, _id: Joi.string().required() })
    .validate(application, { stripUnknown: true });
}

function validateYoung(young, user) {
  const keys = {
    firstName: Joi.string().allow(null, ""),
    lastName: Joi.string().allow(null, ""),
    frenchNationality: Joi.string().allow(null, ""),
    birthCountry: Joi.string().allow(null, ""),
    birthCity: Joi.string().allow(null, ""),
    birthCityZip: Joi.string().allow(null, ""),
    email: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    gender: Joi.string().allow(null, ""),
    birthdateAt: Joi.string().allow(null, ""),
    cohort: Joi.string().allow(null, ""),
    phase: Joi.string().allow(null, ""),
    status: Joi.string().allow(null, ""),
    statusPhase1: Joi.string().allow(null, ""),
    statusPhase1Motif: Joi.string().allow(null, ""),
    statusPhase1MotifDetail: Joi.string().allow(null, ""),
    statusPhase2: Joi.string().allow(null, ""),
    statusPhase2UpdatedAt: Joi.string().allow(null, ""),
    statusPhase2Contract: Joi.array().items(Joi.string().allow(null, "")),
    statusPhase3: Joi.string().allow(null, ""),
    lastStatusAt: Joi.alternatives().try(Joi.string().allow(null, ""), Joi.number().allow(null)),
    withdrawnMessage: Joi.string().allow(null, ""),
    inscriptionStep: Joi.string().allow(null, ""),
    cohesion2020Step: Joi.string().allow(null, ""),
    historic: Joi.array().items(Joi.any().allow(null, "")),
    lastLoginAt: Joi.string().allow(null, ""),
    forgotPasswordResetToken: Joi.string().allow(null, ""),
    forgotPasswordResetExpires: Joi.string().allow(null, ""),
    invitationToken: Joi.string().allow(null, ""),
    invitationExpires: Joi.string().allow(null, ""),
    cniFiles: Joi.array().items(Joi.string().allow(null, "")),
    cohesionStayPresence: Joi.string().allow(null, ""),
    cohesionStayMedicalFileReceived: Joi.string().allow(null, ""),
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
    zip: Joi.string().allow(null, ""),
    city: Joi.string().allow(null, ""),
    cityCode: Joi.string().allow(null, ""),
    populationDensity: Joi.string().allow(null, ""),
    department: Joi.string().allow(null, ""),
    region: Joi.string().allow(null, ""),
    location: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    qpv: Joi.string().allow(null, ""),
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
    schoolLocation: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    schoolId: Joi.string().allow(null, ""),
    parent1Status: Joi.string().allow(null, ""),
    parent1FirstName: Joi.string().allow(null, ""),
    parent1LastName: Joi.string().allow(null, ""),
    parent1Email: Joi.string().allow(null, ""),
    parent1Phone: Joi.string().allow(null, ""),
    parent1OwnAddress: Joi.string().allow(null, ""),
    parent1Address: Joi.string().allow(null, ""),
    parent1ComplementAddress: Joi.string().allow(null, ""),
    parent1Zip: Joi.string().allow(null, ""),
    parent1City: Joi.string().allow(null, ""),
    parent1Department: Joi.string().allow(null, ""),
    parent1Region: Joi.string().allow(null, ""),
    parent1Location: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    parent1FromFranceConnect: Joi.string().allow(null, ""),
    parent2Status: Joi.string().allow(null, ""),
    parent2FirstName: Joi.string().allow(null, ""),
    parent2LastName: Joi.string().allow(null, ""),
    parent2Email: Joi.string().allow(null, ""),
    parent2Phone: Joi.string().allow(null, ""),
    parent2OwnAddress: Joi.string().allow(null, ""),
    parent2Address: Joi.string().allow(null, ""),
    parent2ComplementAddress: Joi.string().allow(null, ""),
    parent2Zip: Joi.string().allow(null, ""),
    parent2City: Joi.string().allow(null, ""),
    parent2Department: Joi.string().allow(null, ""),
    parent2Region: Joi.string().allow(null, ""),
    parent2Location: Joi.object()
      .keys({
        lat: Joi.number().allow(null),
        lon: Joi.number().allow(null),
      })
      .allow(null),
    parent2FromFranceConnect: Joi.string().allow(null, ""),
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
  };

  if (!isYoung(user)) {
    keys.password = Joi.string().allow(null, "");
  }

  return Joi.object().keys(keys).validate(young, { stripUnknown: true });
}

function validateDepartmentService(departmentService) {
  return Joi.object()
    .keys({
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
function validateWaitingList(waitingList) {
  return Joi.object()
    .keys({
      zip: Joi.string().allow(null, ""),
      mail: Joi.string().allow(null, ""),
      birthdateAt: Joi.string().allow(null, ""),
    })
    .validate(waitingList, { stripUnknown: true });
}

function validateReferent(referent) {
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
      department: Joi.string().allow(null, ""),
      subRole: Joi.string()
        .allow(null, "")
        .valid(...SUB_ROLES_LIST),
      cohesionCenterId: Joi.string().allow(null, ""),
      cohesionCenterName: Joi.string().allow(null, ""),
      phone: Joi.string().allow(null, ""),
      mobile: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
    })
    .validate(referent, { stripUnknown: true });
}

function validateEvent(event) {
  return Joi.object()
    .keys({
      category: Joi.string().allow(null, ""),
      action: Joi.string().allow(null, ""),
      value: Joi.string().allow(null, ""),
    })
    .validate(event, { stripUnknown: true });
}

function validateSelf(referent) {
  // Referents can not update their role.
  return Joi.object()
    .keys({
      firstName: validateFirstName().allow(null, ""),
      lastName: Joi.string().uppercase().allow(null, ""),
      email: Joi.string().lowercase().trim().email().allow(null, ""),
      password: Joi.string().allow(null, ""),
      region: Joi.string().allow(null, ""),
      department: Joi.string().allow(null, ""),
      subRole: Joi.string()
        .allow(null, "")
        .valid(...SUB_ROLES_LIST),
      cohesionCenterId: Joi.string().allow(null, ""),
      cohesionCenterName: Joi.string().allow(null, ""),
      phone: Joi.string().allow(null, ""),
      mobile: Joi.string().allow(null, ""),
      structureId: Joi.string().allow(null, ""),
    })
    .validate(referent, { stripUnknown: true });
}

module.exports = {
  validateId,
  validateString,
  validateMission,
  validateStructure,
  validateProgram,
  validateFirstName,
  validateNewCohesionCenter,
  validateUpdateCohesionCenter,
  validateYoung,
  validateDepartmentService,
  validateReferent,
  validateSelf,
  validateNewApplication,
  validateUpdateApplication,
  validateWaitingList,
  validateContract,
  validateOptionalId,
  validateEvent,
};
