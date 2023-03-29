export const PHONE_ZONES_NAMES = {
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

export const PHONE_ZONES = {
  FRANCE: {
    shortcut: "FR",
    code: "+33",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUADELOUPE: {
    shortcut: "GP",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUYANE: {
    shortcut: "GY",
    code: "+594",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  LA_REUNION: {
    shortcut: "RE",
    code: "+262",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MARTINIQUE: {
    shortcut: "MQ",
    code: "+596",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MAYOTTE: {
    shortcut: "YT",
    code: "+262",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  NOUVELLE_CALEDONIE: {
    shortcut: "NC",
    code: "+687",
    numberLength: 6,
    errorMessage: "Votre numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  POLYNESIE_FRANCAISE: {
    shortcut: "PF",
    code: "+689",
    numberLength: 8,
    errorMessage: "Votre numéro de téléphone doit contenir 8 chiffres.",
    example: "XXXXXXXX",
  },
  SAINT_BARTHELEMY: {
    shortcut: "BL",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_MARTIN: {
    shortcut: "MF",
    code: "+590",
    numberLength: 10,
    errorMessage: "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_PIERRE_ET_MIQUELON: {
    shortcut: "PM",
    code: "+508",
    numberLength: 6,
    errorMessage: "Votre numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  WALLIS_ET_FUTUNA: {
    shortcut: "WF",
    code: "+681",
    numberLength: 6,
    errorMessage: "Votre numéro de téléphone doit contenir 6 chiffres.",
    example: "XXXXXX",
  },
  AUTRE: {
    shortcut: "Autre",
    code: null,
    numberLength: null,
    errorMessage: null,
    example: null,
  },
};

export const isPhoneZoneKnown = ({ zoneKey, throwError = true }) => {
  const isPhoneZoneIncluded = Object.keys(PHONE_ZONES).includes(zoneKey);
  if (!isPhoneZoneIncluded && throwError) {
    throw new Error(`Phone zone '${zoneKey}' unkown. Please check if this phone zone exists in PHONE_ZONES in 'src/utils/phone-number.utils.js'.`);
  }
  return isPhoneZoneIncluded;
};

export const isPhoneNumberWellFormated = (phoneNumberValue, zoneKey) => {
  const phoneZone = PHONE_ZONES[zoneKey];

  if (!phoneZone.numberLength) {
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
