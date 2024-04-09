import Joi from "joi";
import { PHONE_ZONES_NAMES_ARR, YOUNG_SITUATIONS, GRADES } from "snu-lib";

export function filterDataObject(data, section) {
  const filteredData = {};
  let bodySchema = {};

  if (section === "identite") {
    bodySchema = Joi.object().keys({
      firstName: Joi.string().trim(),
      lastName: Joi.string().uppercase(),
      gender: Joi.string().valid("male", "female"),
      email: Joi.string().lowercase().trim(),
      phone: Joi.string().trim(),
      phoneZone: Joi.string()
        .trim()
        .valid(...PHONE_ZONES_NAMES_ARR)
        .allow("", null),
      latestCNIFileExpirationDate: Joi.date().allow(null),
      latestCNIFileCategory: Joi.string().trim(),
      frenchNationality: Joi.string().trim(),
      birthdateAt: Joi.date(),
      birthCity: Joi.string().trim(),
      birthCityZip: Joi.string().trim(),
      birthCountry: Joi.string().trim(),
      address: Joi.string().trim(),
      zip: Joi.string().trim(),
      city: Joi.string().trim(),
      country: Joi.string().trim().allow(""),
      cityCode: Joi.string().trim().allow(""),
      region: Joi.string().trim().allow(""),
      department: Joi.string().trim().allow(""),
      location: Joi.any(),
      addressVerified: Joi.boolean(),
      foreignAddress: Joi.string().trim().allow(""),
      foreignZip: Joi.string().trim().allow(""),
      foreignCity: Joi.string().trim().allow(""),
      foreignCountry: Joi.string().trim().allow(""),
    });
  } else if (section === "parent") {
    bodySchema = Joi.object().keys({
      situation: Joi.string().valid(...Object.keys(YOUNG_SITUATIONS)),
      schoolId: Joi.string().trim().allow(""),
      schoolName: Joi.string().trim().allow(""),
      schoolCity: Joi.string().trim().allow(""),
      schoolCountry: Joi.string().trim().allow(""),
      schoolType: Joi.string().trim().allow(""),
      schoolAddress: Joi.string().trim().allow(""),
      schoolComplementAdresse: Joi.string().trim().allow(""),
      schoolZip: Joi.string().trim().allow(""),
      schoolDepartment: Joi.string().trim().allow(""),
      schoolRegion: Joi.string().trim().allow(""),
      grade: Joi.string().valid(...Object.keys(GRADES)),
      sameSchoolCLE: Joi.string().trim(),

      parent1Status: Joi.string().trim().allow(""),
      parent1LastName: Joi.string().trim().allow(""),
      parent1FirstName: Joi.string().trim().allow(""),
      parent1Email: Joi.string().trim().allow(""),
      parent1Phone: Joi.string().trim().allow(""),
      parent1PhoneZone: Joi.string()
        .trim()
        .valid(...PHONE_ZONES_NAMES_ARR)
        .allow("", null),
      parent1OwnAddress: Joi.string().trim().valid("true", "false").allow(""),
      parent1Address: Joi.string().trim().allow(""),
      parent1Zip: Joi.string().trim().allow(""),
      parent1City: Joi.string().trim().allow(""),
      parent1Country: Joi.string().trim().allow(""),

      parent2Status: Joi.string().trim().allow(""),
      parent2LastName: Joi.string().trim().allow(""),
      parent2FirstName: Joi.string().trim().allow(""),
      parent2Email: Joi.string().trim().allow(""),
      parent2Phone: Joi.string().trim().allow(""),
      parent2PhoneZone: Joi.string()
        .trim()
        .valid(...PHONE_ZONES_NAMES_ARR)
        .allow("", null),
      parent2OwnAddress: Joi.string().trim().valid("true", "false").allow(""),
      parent2Address: Joi.string().trim().allow(""),
      parent2Zip: Joi.string().trim().allow(""),
      parent2City: Joi.string().trim().allow(""),
      parent2Country: Joi.string().trim().allow(""),

      qpv: Joi.string().trim().valid("true", "false").allow("", null),
      handicap: Joi.string().trim().valid("true", "false").allow("", null),
      ppsBeneficiary: Joi.string().trim().valid("true", "false").allow("", null),
      paiBeneficiary: Joi.string().trim().valid("true", "false").allow("", null),
      specificAmenagment: Joi.string().trim().valid("true", "false").allow("", null),
      specificAmenagmentType: Joi.string().trim().allow(""),
      reducedMobilityAccess: Joi.string().trim().valid("true", "false").allow("", null),
      handicapInSameDepartment: Joi.string().trim().valid("true", "false").allow("", null),
      allergies: Joi.string().trim().valid("true", "false").allow("", null),

      // old cohorts
      imageRightFilesStatus: Joi.string().trim().valid("TO_UPLOAD", "WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED"),
    });
  }

  Object.keys(data).forEach((key) => {
    const { error } = bodySchema.validate({ [key]: data[key] });
    if (!error) {
      filteredData[key] = data[key];
    }
  });

  return filteredData;
}
