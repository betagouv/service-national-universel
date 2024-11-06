import { parsePhoneNumberFromString } from "libphonenumber-js";
import { concatPhoneNumberWithZone, PHONE_ZONES } from "snu-lib";
import { capture } from "../sentry";

// ! Delete capture if no errors in months

export const formatPhoneE164 = (phone, phoneZone) => {
  if (!phone) {
    return;
  }
  if (typeof phone !== "string") {
    capture("Pb with phone format" + JSON.stringify(phone));
    return;
  }

  if (!phoneZone || phoneZone === "AUTRE") return phone;

  const zone = PHONE_ZONES[phoneZone].shortcut;

  const phoneNumber = parsePhoneNumberFromString(phone, zone);
  if (!phoneNumber) capture("Failed to parse phoneNumber : " + JSON.stringify(phone));

  return phoneNumber ? phoneNumber.format("E.164") : concatPhoneNumberWithZone(phone, phoneZone);
};
