export const getPhoneZoneByDepartment = (department) => {
  if (!department) {
    return;
  }
  let phoneZoneName = "";
  switch (department) {
    case "Guadeloupe":
      phoneZoneName = "GUADELOUPE";
      break;
    case "Guyane":
      phoneZoneName = "GUYANE";
      break;
    case "La Réunion":
      phoneZoneName = "LA_REUNION";
      break;
    case "Martinique":
      phoneZoneName = "MARTINIQUE";
      break;
    case "Mayotte":
      phoneZoneName = "MAYOTTE";
      break;
    case "Nouvelle-Calédonie":
      phoneZoneName = "NOUVELLE_CALEDONIE";
      break;
    case "Polynésie Française":
      phoneZoneName = "POLYNESIE_FRANCAISE";
      break;
    case "St-Pierre-et-Miquelon":
      phoneZoneName = "SAINT_PIERRE_ET_MIQUELON";
      break;
    case "Wallis-et-Futuna":
      phoneZoneName = "WALLIS_ET_FUTUNA";
      break;
    default:
      phoneZoneName = "FRANCE";
  }

  return phoneZoneName;
};
