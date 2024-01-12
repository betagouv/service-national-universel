import { ABROAD, FRANCE, stringToBoolean } from "./commons";
import validator from "validator";

export function getDataForConsentStep(young, parentId) {
  if (!young) return null;

  const address = getAddress(young, parentId);
  const confirmAddress = !validator.isEmpty(address.address, { ignore_whitespace: true }) && !validator.isEmpty(address.city, { ignore_whitespace: true });
  const internalRules = stringToBoolean(young[`rulesParent${parentId}`]);

  return {
    firstName: young[`parent${parentId}FirstName`] ? young[`parent${parentId}FirstName`] : "",
    lastName: young[`parent${parentId}LastName`] ? young[`parent${parentId}LastName`] : "",
    email: young[`parent${parentId}Email`] ? young[`parent${parentId}Email`] : "",
    phone: young[`parent${parentId}Phone`] ? young[`parent${parentId}Phone`] : "",
    phoneZone: young[`parent${parentId}PhoneZone`] ? young[`parent${parentId}PhoneZone`] : "",
    confirmAddress,
    livesInFrance: address.country && address.country !== FRANCE ? ABROAD : FRANCE,
    ...address,
    allowSNU: stringToBoolean(young.parentAllowSNU),
    rightOlder: internalRules,
    personalData: internalRules,
    healthForm: internalRules,
    vaccination: internalRules,
    internalRules,
    allowImageRights: stringToBoolean(young[`parent${parentId}AllowImageRights`]),
  };
}

export function getAddress(young, parentId) {
  if (young[`parent${parentId}OwnAddress`] === "true")
    return {
      address: young[`parent${parentId}Address`] ? young[`parent${parentId}Address`] : "",
      addressVerified: young[`addressParent${parentId}Verified`] ? young[`addressParent${parentId}Verified`] : "false",
      coordinatesAccuracyLevel: young[`parent${parentId}coordinatesAccuracyLevel`] ? young[`parent${parentId}coordinatesAccuracyLevel`] : "",
      addressComplement: young[`parent${parentId}ComplementAddress`] ? young[`parent${parentId}ComplementAddress`] : "",
      zip: young[`parent${parentId}Zip`] ? young[`parent${parentId}Zip`] : "",
      city: young[`parent${parentId}City`] ? young[`parent${parentId}City`] : "",
      country: young[`parent${parentId}Country`] ? young[`parent${parentId}Country`] : "",
      cityCode: young[`parent${parentId}CityCode`] ? young[`parent${parentId}CityCode`] : "",
      department: young[`parent${parentId}Department`] ? young[`parent${parentId}Department`] : null,
      region: young[`parent${parentId}Region`] ? young[`parent${parentId}Region`] : null,
      location: young[`parent${parentId}Location`] ? young[`parent${parentId}Location`] : null,
    };

  return {
    address: young.address ? young.address : "",
    addressVerified: young.addressVerified ? young.addressVerified : "false",
    coordinatesAccuracyLevel: young.coordinatesAccuracyLevel ? young.coordinatesAccuracyLevel : "",
    addressComplement: young.complementAddress ? young.complementAddress : "",
    zip: young.zip ? young.zip : "",
    city: young.city ? young.city : "",
    country: young.country ? young.country : "",
    cityCode: young.cityCode ? young.cityCode : "",
    department: young.department ? young.department : null,
    region: young.region ? young.region : null,
    location: young.location ? young.location : null,
  };
}
