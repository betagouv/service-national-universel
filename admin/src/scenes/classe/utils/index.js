import { STATUS_CLASSE } from "snu-lib";

export const statusClassForBadge = (status) => {
  let statusClasse;

  switch (status) {
    case STATUS_CLASSE.INSCRIPTION_IN_PROGRESS:
      statusClasse = "IN_PROGRESS";
      break;

    case STATUS_CLASSE.INSCRIPTION_TO_CHECK:
      statusClasse = "WAITING_VALIDATION";
      break;

    case STATUS_CLASSE.CREATED:
      statusClasse = "WAITING_LIST";
      break;

    case STATUS_CLASSE.VALIDATED:
      statusClasse = "VALIDATED";
      break;

    case STATUS_CLASSE.WITHDRAWN:
      statusClasse = "CANCEL";
      break;
    case STATUS_CLASSE.DRAFT:
      statusClasse = "DRAFT";
      break;

    default:
      statusClasse = null;
      break;
  }
  return statusClasse;
};
