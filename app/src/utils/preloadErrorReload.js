// Rechargement de la page après l'échec d'un import dynamique. Même fichier dans app/, admin/ et
// snupport-app/ (src/utils/preloadErrorReload.js).
//
// Un `lazy(() => import(...))` échoue quand le fichier demandé n'existe plus (onglet ouvert sur un
// build remplacé depuis) ou qu'il a été mal servi (bascule d'instances du 07/10/2026). Recharger
// récupère l'index.html en ligne, servi en no-cache, et donc les fichiers de son build.
// Pendant une bascule (~1 min), le rechargement peut retomber sur l'ancienne instance et l'écran
// suivant échouer encore. Mais un échec qui survit au rechargement ferait boucler la page : au plus
// deux rechargements automatiques par période de deux minutes et par onglet, puis l'erreur suit son
// cours (ErrorBoundary, Sentry).

export const RELOADS_KEY = "snu-preload-error-reloads";
export const RELOAD_WINDOW_MS = 2 * 60 * 1000;
export const MAX_RELOADS_PER_WINDOW = 2;

// Plusieurs imports peuvent échouer dans la même page (composants lazy affichés ensemble) : un seul
// rechargement compté par page, sinon ils épuiseraient à eux seuls les rechargements de la période
let reloadRequested = false;

// Horodatages des rechargements de la période en cours ; une horloge revenue en arrière ne bloque rien
function recentReloads(stored, now) {
  let timestamps;
  try {
    timestamps = JSON.parse(stored);
  } catch {
    return [];
  }
  if (!Array.isArray(timestamps)) return [];
  return timestamps.filter((timestamp) => typeof timestamp === "number" && now - timestamp >= 0 && now - timestamp < RELOAD_WINDOW_MS);
}

// Renvoie true si un rechargement est lancé, ou l'était déjà par un échec précédent de la page.
export function reloadAfterPreloadError({
  getStorage = () => window.sessionStorage,
  isOnline = () => window.navigator.onLine !== false,
  reload = () => window.location.reload(),
  now = Date.now(),
} = {}) {
  // Hors ligne, l'échec vient du réseau : recharger remplacerait l'application par la page
  // d'erreur réseau du navigateur
  if (!isOnline()) return false;
  if (reloadRequested) return true;
  try {
    const storage = getStorage();
    const reloads = recentReloads(storage.getItem(RELOADS_KEY), now);
    if (reloads.length >= MAX_RELOADS_PER_WINDOW) return false;
    storage.setItem(RELOADS_KEY, JSON.stringify([...reloads, now]));
  } catch {
    // sessionStorage inaccessible (stockage bloqué) : sans garde-fou, pas de rechargement
    return false;
  }
  reloadRequested = true;
  reload();
  return true;
}
