import { PhoneZone as TPhoneZone } from "../types";

const PhoneZones: Record<string, TPhoneZone> = {
  FRANCE: {
    shortcut: "FR",
    name: "France métropolitaine",
    code: "+33",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUADELOUPE: {
    shortcut: "GP",
    name: "Guadeloupe",
    code: "+590",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  GUYANE: {
    shortcut: "GY",
    name: "Guyane",
    code: "+594",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  LA_REUNION: {
    shortcut: "RE",
    name: "La Réunion",
    code: "+262",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MARTINIQUE: {
    shortcut: "MQ",
    name: "Martinique",
    code: "+596",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  MAYOTTE: {
    shortcut: "YT",
    name: "Mayotte",
    code: "+262",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
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
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
    example: "0XXXXXXXXX",
  },
  SAINT_MARTIN: {
    shortcut: "MF",
    name: "Saint-Martin",
    code: "+590",
    numberLength: 10,
    errorMessage:
      "Ce numéro de téléphone doit contenir 10 chiffres et commencer par 0.",
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

export default PhoneZones;
