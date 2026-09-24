// Initialisation de Plausible, hors de index.html pour que la CSP n'ait pas à autoriser les scripts en ligne
window.plausible =
  window.plausible ||
  function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
// Ni query string ni fragment (jetons, termes de recherche) ; identifiants et jetons hexadécimaux remplacés par ":id"
var redactedUrl = (window.location.origin + window.location.pathname).replace(/[0-9a-fA-F]{24,}/g, ":id");
// Send the pageview event to Plausible
window.plausible("pageview", { u: redactedUrl });
