const { generateAddress, generateRandomName, generateRandomEmail, generateBirthdate, getYoungLocation, generateNewPhoneNumber, starify } = require("../utils/anonymise");
const { anonymizeNonDeclaredFields } = require("../utils/anonymise-model-fields");
const crypto = require("crypto");

function anonymize(itemToAnonymize) {
  const whitelist = [
    "_id.$oid",
    "firstName",
    "lastName",
    "frenchNationality",
    "birthCountry",
    "birthCity",
    "birthCityZip",
    "email",
    "emailVerified",
    "newEmail",
    "phone",
    "phoneZone",
    "gender",
    "birthdateAt.$date",
    "cohort",
    "cohortId",
    "originalCohort",
    "originalCohortId",
    "cohortChangeReason",
    "cohortDetailedChangeReason",
    "phase",
    "status",
    "statusPhase1",
    "statusPhase1Tmp",
    "statusPhase1Motif",
    "statusPhase1MotifDetail",
    "statusPhase2",
    "statusPhase2updatedAt.$date",
    "statusPhase2OpenedAt.$date",
    "statusPhase2ValidatedAt.$date",
    "statusPhase2Contract",
    "statusPhase3",
    "statusPhase3updatedAt.$date",
    "statusPhase3ValidatedAt.$date",
    "lastStatusAt.$date",
    "withdrawnReason",
    "withdrawnMessage",
    "hasStartedReinscription",
    "reinscriptionStep2023",
    "inscriptionStep2023",
    "inscriptionStep",
    "inscriptionDoneDate.$date",
    "cohesion2020Step",
    "inscriptionCorrectionMessage",
    "inscriptionRefusedMessage",
    "historic",
    "password",
    "token2FA",
    "token2FAExpires.$date",
    "attempts2FA",
    "tokenEmailValidation",
    "tokenEmailValidationExpires.$date",
    "attemptsEmailValidation",
    "loginAttempts",
    "lastLoginAt.$date",
    "lastActivityAt.$date",
    "lastLogoutAt.$date",
    "passwordChangedAt.$date",
    "nextLoginAttemptIn.$date",
    "forgotPasswordResetToken",
    "forgotPasswordResetExpires.$date",
    "invitationToken",
    "invitationExpires.$date",
    "acceptCGU",
    "acceptRI",
    "cniFiles",
    "cohesionStayPresence",
    "presenceJDM",
    "cohesionStayMedicalFileReceived",
    "departInform",
    "departSejourAt.$date",
    "departSejourMotif",
    "departSejourMotifComment",
    "cohesionStayMedicalFileDownload",
    "convocationFileDownload",
    "classeId",
    "etablissementId",
    "source",
    "sessionPhase1Id",
    "sessionPhase1IdTmp",
    "cohesionCenterId",
    "ligneId",
    "meetingPointId",
    "deplacementPhase1Autonomous",
    "transportInfoGivenByLocal",
    "hasMeetingInformation",
    "isTravelingByPlane",
    "codeCenterTmp",
    "busTmp",
    "cohesionCenterName",
    "cohesionCenterZip",
    "cohesionCenterCity",
    "autoAffectationPhase1ExpiresAt.$date",
    "phase2ApplicationStatus",
    "phase2ApplicationFilesType",
    "phase2NumberHoursDone",
    "phase2NumberHoursEstimated",
    "phase3StructureName",
    "phase3MissionDomain",
    "phase3MissionDescription",
    "phase3MissionStartAt.$date",
    "phase3MissionEndAt.$date",
    "phase3TutorFirstName",
    "phase3TutorLastName",
    "phase3TutorEmail",
    "phase3TutorPhone",
    "phase3TutorNote",
    "phase3Token",
    "address",
    "coordinatesAccuracyLevel",
    "complementAddress",
    "zip",
    "city",
    "addressVerified",
    "cityCode",
    "populationDensity",
    "isRegionRural",
    "department",
    "region",
    "country",
    "location.lat",
    "location.lon",
    "qpv",
    "foreignAddress",
    "foreignCity",
    "foreignZip",
    "foreignCountry",
    "situation",
    "grade",
    "schoolCertification",
    "schooled",
    "schoolName",
    "schoolNameOld",
    "schoolType",
    "schoolAddress",
    "schoolComplementAdresse",
    "schoolZip",
    "schoolCity",
    "schoolDepartment",
    "schoolRegion",
    "schoolCountry",
    "schoolLocation.lat",
    "schoolLocation.lon",
    "schoolId",
    "academy",
    "employed",
    "parent1Status",
    "parent1FirstName",
    "parent1LastName",
    "parent1Email",
    "parent1Phone",
    "parent1PhoneZone",
    "parent1OwnAddress",
    "parent1Address",
    "parent1coordinatesAccuracyLevel",
    "parent1ComplementAddress",
    "parent1Zip",
    "parent1City",
    "parent1CityCode",
    "parent1Department",
    "parent1Region",
    "parent1Country",
    "parent1Location.lat",
    "parent1Location.lon",
    "parent1FromFranceConnect",
    "parent1Inscription2023Token",
    "parent1DataVerified",
    "parent1AddressVerified",
    "parent1AllowCovidAutotest",
    "parent1AllowImageRights",
    "parent1ContactPreference",
    "parent2Status",
    "parent2FirstName",
    "parent2LastName",
    "parent2Email",
    "parent2Phone",
    "parent2PhoneZone",
    "parent2OwnAddress",
    "parent2Address",
    "parent2coordinatesAccuracyLevel",
    "parent2ComplementAddress",
    "parent2Zip",
    "parent2City",
    "parent2CityCode",
    "parent2Department",
    "parent2Region",
    "parent2Country",
    "parent2Location.lat",
    "parent2Location.lon",
    "parent2FromFranceConnect",
    "parent2Inscription2023Token",
    "parent2AllowImageRights",
    "parent2AllowImageRightsReset",
    "parent2ContactPreference",
    "hostLastName",
    "hostFirstName",
    "hostRelationship",
    "hostCity",
    "hostZip",
    "hostAddress",
    "hostDepartment",
    "hostRegion",
    "handicap",
    "allergies",
    "handicapInSameDepartment",
    "reducedMobilityAccess",
    "ppsBeneficiary",
    "paiBeneficiary",
    "medicosocialStructure",
    "medicosocialStructureName",
    "medicosocialStructureAddress",
    "medicosocialStructureComplementAddress",
    "medicosocialStructureZip",
    "medicosocialStructureCity",
    "medicosocialStructureDepartment",
    "medicosocialStructureRegion",
    "medicosocialStructureLocation.lat",
    "medicosocialStructureLocation.lon",
    "engagedStructure",
    "sameSchoolCLE",
    "specificAmenagment",
    "specificAmenagmentType",
    "highSkilledActivity",
    "highSkilledActivityInSameDepartment",
    "highSkilledActivityType",
    "highSkilledActivityProofFiles",
    "parentAllowSNU",
    "parent1AllowSNU",
    "parent2AllowSNU",
    "parent1ValidationDate.$date",
    "parent2ValidationDate.$date",
    "parent2RejectSNUComment",
    "dataProcessingConsentmentFiles",
    "parentConsentment",
    "parentConsentmentFiles",
    "parentConsentmentFilesCompliant",
    "parentConsentmentFilesCompliantInfo",
    "consentment",
    "imageRight",
    "imageRightFiles",
    "imageRightFilesStatus",
    "rulesFilesStatus",
    "psc1Info",
    "imageRightFilesComment",
    "autoTestPCR",
    "autoTestPCRFiles",
    "autoTestPCRFilesStatus",
    "autoTestPCRFilesComment",
    "rulesYoung",
    "rulesParent1",
    "rulesParent2",
    "rulesFiles",
    "informationAccuracy",
    "aknowledgmentTerminaleSessionAvailability",
    "parentStatementOfHonorInvalidId",
    "jdc",
    "motivations",
    "domains",
    "professionnalProject",
    "professionnalProjectPrecision",
    "period",
    "periodRanking",
    "mobilityNearSchool",
    "mobilityNearHome",
    "mobilityNearRelative",
    "mobilityNearRelativeName",
    "mobilityNearRelativeAddress",
    "mobilityNearRelativeZip",
    "mobilityNearRelativeCity",
    "mobilityTransport",
    "mobilityTransportOther",
    "missionFormat",
    "engaged",
    "engagedDescription",
    "desiredLocation",
    "militaryPreparationFilesIdentity",
    "militaryPreparationFilesCensus",
    "militaryPreparationFilesAuthorization",
    "militaryPreparationFilesCertificate",
    "statusMilitaryPreparationFiles",
    "militaryPreparationCorrectionMessage",
    "files.cniFiles",
    "files.highSkilledActivityProofFiles",
    "files.dataProcessingConsentmentFiles",
    "files.parentConsentmentFiles",
    "files.imageRightFiles",
    "files.autoTestPCRFiles",
    "files.rulesFiles",
    "files.militaryPreparationFilesIdentity",
    "files.militaryPreparationFilesCensus",
    "files.militaryPreparationFilesAuthorization",
    "files.militaryPreparationFilesCertificate",
    "latestCNIFileExpirationDate.$date",
    "CNIFileNotValidOnStart",
    "latestCNIFileCategory",
    "missionsInMail.missionId",
    "missionsInMail.date.$date",
    "youngPhase1Agreement",
    "status_equivalence",
    "correctionRequests",
    "notes",
    "hasNotes",
    "defenseInterest",
    "defenseTypeInterest",
    "defenseDomainInterest",
    "defenseMotivationInterest",
    "securityInterest",
    "securityDomainInterest",
    "solidarityInterest",
    "healthInterest",
    "educationInterest",
    "cultureInterest",
    "sportInterest",
    "environmentInterest",
    "citizenshipInterest",
    "deletedAt.$date",
    "createdAt.$date",
    "updatedAt.$date",
    "__v",
  ];
  const item = anonymizeNonDeclaredFields(itemToAnonymize, whitelist);

  item.email && (item.email = generateRandomEmail());
  item.newEmail && (item.newEmail = generateRandomEmail());
  item.parent1Email && (item.parent1Email = generateRandomEmail());
  item.parent2Email && (item.parent2Email = generateRandomEmail());
  item.firstName && (item.firstName = generateRandomName());
  item.lastName && (item.lastName = generateRandomName());
  item.parent1FirstName && (item.parent1FirstName = generateRandomName());
  item.parent1LastName && (item.parent1LastName = generateRandomName());
  item.parent2FirstName && (item.parent2FirstName = generateRandomName());
  item.parent2LastName && (item.parent2LastName = generateRandomName());
  item.historic && (item.historic = {});
  item.phone && (item.phone = generateNewPhoneNumber());
  item.parent1Phone && (item.parent1Phone = generateNewPhoneNumber());
  item.parent2Phone && (item.parent2Phone = generateNewPhoneNumber());
  item.address && (item.address = generateAddress());
  item.parent1Address && (item.parent1Address = generateAddress());
  item.parent2Address && (item.parent2Address = generateAddress());
  item.birthdateAt && (item.birthdateAt = generateBirthdate());
  item.engagedDescription && (item.engagedDescription = starify(item.engagedDescription));
  item.motivations && (item.motivations = starify(item.motivations));
  item.parentConsentmentFilesCompliantInfo && (item.parentConsentmentFilesCompliantInfo = starify(item.parentConsentmentFilesCompliantInfo));
  item.withdrawnReason && (item.withdrawnReason = starify(item.withdrawnReason));
  item.withdrawnMessage && (item.withdrawnMessage = starify(item.withdrawnMessage));
  item.correctionRequests &&
    (item.correctionRequests = item.correctionRequests?.map((e) => {
      e.message = starify(e.message);
      e.reason = starify(e.reason);
      return e;
    }));
  item.notes &&
    (item.notes = item.notes?.map((e) => {
      e.note = starify(e.note);
      if (e.referent) {
        e.referent.firstName = starify(e.referent.firstName);
        e.referent.lastName = starify(e.referent.lastName);
      }
      return e;
    }));

  const newLocation = getYoungLocation(item.zip);
  item.location &&
    (item.location = {
      lat: newLocation?.latitude || 0,
      lon: newLocation?.longitude || 0,
    });

  item.cniFiles && (item.cniFiles = []);
  item.highSkilledActivityProofFiles && (item.highSkilledActivityProofFiles = []);
  item.dataProcessingConsentmentFiles && (item.dataProcessingConsentmentFiles = []);
  item.parentConsentmentFiles && (item.parentConsentmentFiles = []);
  item.imageRightFiles && (item.imageRightFiles = []);
  item.autoTestPCRFiles && (item.autoTestPCRFiles = []);
  item.rulesFiles && (item.rulesFiles = []);
  item.militaryPreparationFilesIdentity && (item.militaryPreparationFilesIdentity = []);
  item.militaryPreparationFilesCensus && (item.militaryPreparationFilesCensus = []);
  item.militaryPreparationFilesAuthorization && (item.militaryPreparationFilesAuthorization = []);
  item.militaryPreparationFilesCertificate && (item.militaryPreparationFilesCertificate = []);
  item.militaryPreparationCorrectionMessage && (item.militaryPreparationCorrectionMessage = starify(item.militaryPreparationCorrectionMessage));

  item.files && (item.files = undefined);

  item.token2FA = "";
  item.tokenEmailValidation = "";
  item.forgotPasswordResetToken = "";
  item.invitationToken = "";
  item.phase3Token = "";
  item.parent1Inscription2023Token = crypto.randomBytes(20).toString("hex");
  item.parent2Inscription2023Token = crypto.randomBytes(20).toString("hex");

  return item;
}

module.exports = anonymize;
