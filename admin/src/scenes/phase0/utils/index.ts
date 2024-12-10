import { YOUNG_SOURCE, YoungDto, YoungType, YOUNG_STATUS } from "snu-lib";
import validator from "validator";

export function filterDataForYoungSection(data: any, section: "identite" | "parent") {
  let bodyYoungSection: Partial<YoungDto> & { etablissementDepartment?: string } = {};
  if (section === "identite") {
    bodyYoungSection = {
      _id: data._id,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      email: data.email,
      etablissementDepartment: data.source === YOUNG_SOURCE.VOLONTAIRE ? data.schoolDepartment : data.etablissement?.department,
      phone: data.phone,
      phoneZone: data.phoneZone,
      latestCNIFileExpirationDate: data.latestCNIFileExpirationDate,
      latestCNIFileCategory: data.latestCNIFileCategory,
      frenchNationality: data.frenchNationality,
      birthdateAt: data.birthdateAt,
      birthCity: data.birthCity,
      birthCityZip: data.birthCityZip,
      birthCountry: data.birthCountry,
      address: data.address,
      zip: data.zip,
      city: data.city,
      country: data.country,
      cityCode: data.cityCode,
      region: data.region,
      department: data.department,
      location: data.location,
      addressVerified: data.addressVerified,
      foreignAddress: data.foreignAddress,
      foreignZip: data.foreignZip,
      foreignCity: data.foreignCity,
      foreignCountry: data.foreignCountry,
      files: data.files,
      cohort: data.cohort,
      parentStatementOfHonorInvalidId: data.parentStatementOfHonorInvalidId,
      parent1Email: data.parent1Email,
    };
  } else if (section === "parent") {
    bodyYoungSection = {
      situation: data.situation,
      schoolId: data.schoolId,
      schoolName: data.schoolName,
      schoolCity: data.schoolCity,
      schoolCountry: data.schoolCountry,
      schoolType: data.schoolType,
      schoolAddress: data.schoolAddress,
      schoolComplementAdresse: data.schoolComplementAdresse,
      schoolZip: data.schoolZip,
      schoolDepartment: data.schoolDepartment,
      schoolRegion: data.schoolRegion,
      grade: data.grade,
      sameSchoolCLE: data.sameSchoolCLE,
      parent1Status: data.parent1Status,
      parent1LastName: data.parent1LastName,
      parent1FirstName: data.parent1FirstName,
      parent1Email: data.parent1Email,
      parent1Phone: data.parent1Phone,
      parent1PhoneZone: data.parent1PhoneZone,
      parent1OwnAddress: data.parent1OwnAddress,
      parent1Address: data.parent1Address,
      parent1Zip: data.parent1Zip,
      parent1City: data.parent1City,
      parent1Country: data.parent1Country,
      parent2Status: data.parent2Status,
      parent2LastName: data.parent2LastName,
      parent2FirstName: data.parent2FirstName,
      parent2Email: data.parent2Email,
      parent2Phone: data.parent2Phone,
      parent2PhoneZone: data.parent2PhoneZone,
      parent2OwnAddress: data.parent2OwnAddress,
      parent2Address: data.parent2Address,
      parent2Zip: data.parent2Zip,
      parent2City: data.parent2City,
      parent2Country: data.parent2Country,
      qpv: data.qpv,
      handicap: data.handicap,
      ppsBeneficiary: data.ppsBeneficiary,
      paiBeneficiary: data.paiBeneficiary,
      specificAmenagment: data.specificAmenagment,
      specificAmenagmentType: data.specificAmenagmentType,
      reducedMobilityAccess: data.reducedMobilityAccess,
      handicapInSameDepartment: data.handicapInSameDepartment,
      allergies: data.allergies,
      imageRightFilesStatus: data.imageRightFilesStatus,
    };
  }

  return bodyYoungSection;
}

export function validateEmpty(value, name, errors, message = "Ne peut être vide") {
  // console.log("test ", name, value, !value[name] || validator.isEmpty(value[name], { ignore_whitespace: true }));
  if (!value[name] || validator.isEmpty(value[name], { ignore_whitespace: true })) {
    errors[name] = message;
    return false;
  } else {
    return true;
  }
}

export function getCorrectionRequest(requests, field) {
  return requests.find((req) => {
    return req.field === field;
  });
}

export function getYoungStatusForBascule(youngStatus: string) {
  if (youngStatus === YOUNG_STATUS.NOT_AUTORISED || youngStatus === YOUNG_STATUS.IN_PROGRESS || youngStatus === YOUNG_STATUS.REINSCRIPTION) {
    return YOUNG_STATUS.IN_PROGRESS;
  } else return YOUNG_STATUS.WAITING_VALIDATION;
}
