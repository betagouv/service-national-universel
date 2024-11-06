const { generateAddress, generateRandomName, generateRandomEmail, generateBirthdate, getYoungLocation, generateNewPhoneNumber, starify } = require("../utils/anonymise");

function anonymize(item) {
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
  item.parent1Inscription2023Token = "";
  item.parent2Inscription2023Token = "";

  return item;
}

module.exports = anonymize;
