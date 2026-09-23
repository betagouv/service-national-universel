import { toastr } from "react-redux-toastr";
import { isInternalRedirectUrl, isValidRedirectUrl } from "snu-lib";
import { captureMessage } from "@/sentry";

// Redirection après connexion. Un chemin relatif est suivi dans l'application (history.push) ;
// seule une URL https d'un domaine SNU (la base de connaissance) fait quitter l'application.
// Tout le reste (javascript:, domaine tiers ou imité) renvoie à l'accueil.
export function redirectAfterSignin(history: { push: (path: string) => void }, redirect: unknown): void {
  if (!redirect) return history.push("/");
  if (isInternalRedirectUrl(redirect)) return history.push(redirect as string);

  if (isValidRedirectUrl(redirect)) {
    window.location.assign(redirect as string);
    return;
  }

  captureMessage("Invalid redirect url", { extra: { redirect } });
  toastr.error("Erreur", "Url de redirection invalide");
  history.push("/");
}
