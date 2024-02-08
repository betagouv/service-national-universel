const PHONE_ZONES_NAMES = {
  FRANCE: "FRANCE",
  GUADELOUPE: "GUADELOUPE",
  GUYANE: "GUYANE",
  LA_REUNION: "LA_REUNION",
  MARTINIQUE: "MARTINIQUE",
  MAYOTTE: "MAYOTTE",
  NOUVELLE_CALEDONIE: "NOUVELLE_CALEDONIE",
  POLYNESIE_FRANCAISE: "POLYNESIE_FRANCAISE",
  SAINT_BARTHELEMY: "SAINT_BARTHELEMY",
  SAINT_MARTIN: "SAINT_MARTIN",
  SAINT_PIERRE_ET_MIQUELON: "SAINT_PIERRE_ET_MIQUELON",
  WALLIS_ET_FUTUNA: "WALLIS_ET_FUTUNA",
  AUTRE: "AUTRE",
};

const PHONE_ZONES = {
  FRANCE: {
    shortcut: "FR",
    name: "France métropolitaine",
    code: "+33",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUADELOUPE: {
    shortcut: "GP",
    name: "Guadeloupe",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUYANE: {
    shortcut: "GY",
    name: "Guyane",
    code: "+594",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  LA_REUNION: {
    shortcut: "RE",
    name: "La Réunion",
    code: "+262",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MARTINIQUE: {
    shortcut: "MQ",
    name: "Martinique",
    code: "+596",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MAYOTTE: {
    shortcut: "YT",
    name: "Mayotte",
    code: "+262",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  NOUVELLE_CALEDONIE: {
    shortcut: "NC",
    name: "Nouvelle-Calédonie",
    code: "+687",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  POLYNESIE_FRANCAISE: {
    shortcut: "PF",
    name: "Polynésie française",
    code: "+689",
    numberLength: 8,
    errorMessage: "Ce numéro de téléphone doit contenir 8 chiffres.",
    example: "XXXXXXXX",
  },
  SAINT_BARTHELEMY: {
    shortcut: "BL",
    name: "Saint-Barthélémy",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_MARTIN: {
    shortcut: "MF",
    name: "Saint-Martin",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_PIERRE_ET_MIQUELON: {
    shortcut: "PM",
    name: "Saint-Pierre-et-Miquelon",
    code: "+508",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  WALLIS_ET_FUTUNA: {
    shortcut: "WF",
    name: "Wallis-et-Futuna",
    code: "+681",
    numberLength: 6,
    errorMessage: "Ce numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  AUTRE: {
    shortcut: "Autre",
    name: "Autre",
    code: null,
    numberLength: null,
    errorMessage: null,
    example: "Numéro de téléphone",
  },
};

const PHONE_ZONES_NAMES_ARR = Object.values(PHONE_ZONES_NAMES);

const formatPhoneNumberFromPhoneZone = (phoneNumber, phoneZoneKey) => {
  const phoneZone = PHONE_ZONES[phoneZoneKey];

  if (!phoneNumber || !phoneZone || !phoneZone.numberLength) {
    return phoneNumber;
  }

  if (phoneZone.numberLength === 10 && phoneNumber.length === 10) {
    return phoneNumber;
  }

  if (phoneZone.numberLength === 10 && phoneNumber.length === 9) {
    return `0${phoneNumber}`;
  }
  return phoneNumber;
};

const isPhoneZoneKnown = ({ zoneKey, throwError = true }) => {
  const isPhoneZoneIncluded = Object.keys(PHONE_ZONES).includes(zoneKey);
  if (!isPhoneZoneIncluded && throwError) {
    throw new Error(`Phone zone '${zoneKey}' unkown. Please check if this phone zone exists in PHONE_ZONES in 'snu-lib/phone-number.js'.`);
  }
  return isPhoneZoneIncluded;
};

const isPhoneNumberWellFormated = (phoneNumberValue, zoneKey) => {
  const phoneZone = PHONE_ZONES[zoneKey];

  if (!phoneZone?.numberLength) {
    return true;
  }

  const expectedPhoneNumberLength = phoneZone.numberLength;

  if (expectedPhoneNumberLength !== 10) {
    return expectedPhoneNumberLength === phoneNumberValue.length;
  }

  if (expectedPhoneNumberLength === 10) {
    const shouldPhoneNumberStartWithZero = phoneNumberValue.length === expectedPhoneNumberLength;
    const hasPhoneNumberAZero = phoneNumberValue.charAt(0) === "0";
    return (shouldPhoneNumberStartWithZero && hasPhoneNumberAZero) || (!shouldPhoneNumberStartWithZero && phoneNumberValue.length === 9 && !hasPhoneNumberAZero);
  }
};

const concatPhoneNumberWithZone = (phoneNumber, zoneKey) => {
  const verifiedZoneKey = zoneKey || "AUTRE";
  if (verifiedZoneKey === "AUTRE") {
    return phoneNumber;
  }
  const phoneZone = PHONE_ZONES[verifiedZoneKey];
  return `(${phoneZone.code}) ${phoneNumber}`;
};

export { PHONE_ZONES, PHONE_ZONES_NAMES, PHONE_ZONES_NAMES_ARR, formatPhoneNumberFromPhoneZone, isPhoneZoneKnown, isPhoneNumberWellFormated, concatPhoneNumberWithZone };
