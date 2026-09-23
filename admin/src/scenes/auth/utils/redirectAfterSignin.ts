import { toastr } from "react-redux-toastr";
import { FEATURES_NAME, isFeatureEnabled, isInternalRedirectUrl, isValidRedirectUrl } from "snu-lib";
import { environment } from "@/config";
import { captureMessage } from "@/sentry";

// En développement (FORCE_REDIRECT), la base de connaissance tourne sur localhost en http.
const LOCAL_URL = /^http:\/\/localhost(:\d+)?(\/|$)/;

// Redirection après connexion. Un chemin relatif est suivi dans l'application (history.push) ;
// seule une URL https d'un domaine SNU fait quitter l'application. Tout le reste
// (javascript:, domaine tiers ou imité) renvoie à l'accueil.
export function redirectAfterSignin(history: { push: (path: string) => void }, redirect: unknown): void {
  if (!redirect) return history.push("/");
  if (isInternalRedirectUrl(redirect)) return history.push(redirect as string);

  const isLocalUrl = isFeatureEnabled(FEATURES_NAME.FORCE_REDIRECT, undefined, environment) && typeof redirect === "string" && LOCAL_URL.test(redirect);
  if (isValidRedirectUrl(redirect) || isLocalUrl) {
    window.location.assign(redirect as string);
    return;
  }

  captureMessage("Invalid redirect url", { extra: { redirect } });
  toastr.error("Url de redirection invalide", "");
  history.push("/");
}
