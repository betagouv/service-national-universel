import { environment } from "../config";

// Sans `u`, Plausible envoie window.location.href : query string (jetons, termes de recherche) comprise
function redactedPageUrl() {
  return (window.location.origin + window.location.pathname).replace(/[0-9a-fA-F]{24,}/g, ":id");
}

export default function plausibleEvent(goal, props = {}) {
  if (environment === "production") {
    window.plausible?.(goal, { u: redactedPageUrl(), props: { device: navigator?.userAgentData?.mobile ? "mobile" : "desktop", ...props } });
  }
}
