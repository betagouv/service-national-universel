import API from "./api";
import { toastr } from "react-redux-toastr";
import { capture } from "../sentry";
export async function fetchReInscriptionOpen() {
  try {
    const { ok, data, code } = await API.get(`/cohort-session/isReInscriptionOpen`);
    if (!ok) {
      capture(new Error(code));
      toastr.error("Oups, une erreur est survenue", code);
      return null;
    }
    return data;
  } catch (e) {
    capture(e);
    toastr.error("Erreur de connexion", e.message);
    return null;
  }
}
