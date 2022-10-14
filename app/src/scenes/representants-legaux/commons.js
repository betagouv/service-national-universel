export const HEALTH_FORM_URL = "https://docs.google.com/document/d/1sRAdenWmJtmKj4I1ZS_FRwSZgAxglg1T/edit?usp=sharing&ouid=110263322243720918742&rtpof=true&sd=true";

export const FRANCE = "France";
export const ABROAD = "Abroad";

export const API_VERIFICATION = "/representants-legaux/data-verification";
export const API_CONSENT = "/representants-legaux/consent";
export const API_DECLARATION_CNI_INVALIDE = "/representants-legaux/cni-invalide";

export const ERROR_MESSAGES = {
  firstName: {
    empty: "Votre prénom ne peut être vide",
  },
  lastName: {
    empty: "Votre nom ne peut être vide",
  },
  email: {
    empty: "Votre email est obligatoire",
    invalid: "Il semble y avoir une erreur dans votre adresse email. Veuillez la vérifier.",
  },
  phone: {
    empty: "Votre numéro de téléphone est obligatoire",
    invalid: "Il semble y avoir une erreur dans votre numéro de téléphone. Veuillez le vérifier.",
  },
  address: {
    empty: "Vous devez précisez votre adresse de résidence.",
  },
  zip: {
    empty: "Veuillez entrer le code postal de votre adresse de résidence",
    invalid: "Le code postal semble invalide. Veuillez le vérifier.",
  },
  city: {
    empty: "Vous devez précisez votre ville de résidence",
  },
  country: {
    empty: "Veuillez préciser votre pays de résidence",
  },
  allowSNU: {
    not_choosen: "Vous devez faire un choix",
  },
  allowCovidAutotest: {
    not_choosen: "Vous devez faire un choix",
  },
  allowImageRights: {
    not_choosen: "Vous devez faire un choix",
  },
  rightOlder: {
    unchecked: "Vous devez confirmer ce point.",
  },
  personalData: {
    unchecked: "Vous devez accepter ce point.",
  },
  healthForm: {
    unchecked: "Vous devez confirmer votre engagement.",
  },
  vaccination: {
    unchecked: "Vous devez confirmer votre engagement.",
  },
  internalRules: {
    unchecked: "Vous devez confirmer ce point.",
  },
};

export function translateError(path) {
  const parts = path.split(".");

  const result = translatePart(ERROR_MESSAGES, parts, 0);
  return result || path;

  function translatePart(messages, parts, index) {
    if (messages && index <= parts.length) {
      if (index === parts.length) {
        return messages;
      } else {
        return translatePart(messages[parts[index]], parts, index + 1);
      }
    } else {
      return null;
    }
  }
}

export function stringToBoolean(val, defaultValue = null) {
  if (val === "true") {
    return true;
  } else if (val === "false") {
    return false;
  } else {
    return defaultValue;
  }
}

export function booleanToString(val, defaultValue = null) {
  if (val === true) {
    return "true";
  } else if (val === false) {
    return "false";
  } else {
    return defaultValue;
  }
}

export function isReturningParent(young, parentId) {
  return (
    (parentId === 1 && (young.parentAllowSNU === "true" || young.parentAllowSNU === "false")) ||
    (parentId === 2 && (young.parent2AllowImageRights === "true" || young.parent2AllowImageRights === "false"))
  );
}
