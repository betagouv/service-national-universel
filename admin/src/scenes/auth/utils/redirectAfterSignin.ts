import { toastr } from "react-redux-toastr";
import { getSafeExternalRedirectUrl, isInternalRedirectUrl } from "snu-lib";
import { captureMessage } from "@/sentry";

// Redirection après connexion. Un chemin relatif est suivi dans l'application (history.push) ;
// seule une URL d'un front SNU, reconstruite depuis une origine autorisée, fait quitter
// l'application. Tout le reste (javascript:, domaine tiers ou imité) renvoie à l'accueil.
export function redirectAfterSignin(history: { push: (path: string) => void }, redirect: unknown): void {
  if (!redirect) return history.push("/");
  if (isInternalRedirectUrl(redirect)) return history.push(redirect as string);

  const externalUrl = getSafeExternalRedirectUrl(redirect);
  if (externalUrl) {
    window.location.assign(externalUrl);
    return;
  }

  captureMessage("Invalid redirect url", { extra: { redirect } });
  toastr.error("Url de redirection invalide", "");
  history.push("/");
}
