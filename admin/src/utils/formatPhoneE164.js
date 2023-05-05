import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PHONE_ZONES } from "../../../lib/phone-number";
import { concatPhoneNumberWithZone } from "snu-lib/phone-number";

export const formatPhoneE164 = (phone, phoneZone) => {
  if (phoneZone) {
    if (phoneZone === "AUTRE") {
      concatPhoneNumberWithZone(phone, phoneZone);
    } else {
      const zone = PHONE_ZONES[phoneZone].shortcut;
      if (typeof phone === "string") {
        const phoneNumber = parsePhoneNumberFromString(phone, zone);
        return phoneNumber ? phoneNumber.format("E.164") : concatPhoneNumberWithZone(phone, phoneZone);
      }
    }
  } else {
    return phone;
  }
};
