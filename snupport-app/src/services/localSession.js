import { resetTicketPreview } from "../redux/ticketPreview/actions";
import { clearSessionContent } from "../utils/localSessionKeys";
import { capture } from "../sentry";

let session = null;

export function registerLocalSession({ store, persistor }) {
  session = { store, persistor };
}

// Efface ce que la session a laissé dans le navigateur : aperçus de tickets (redux-persist), cache
// des articles et brouillons de la base de connaissance. Appelé à la déconnexion et sur toute
// réponse 401, pour que le poste suivant ne relise pas les données de l'agent précédent (FM21).
export async function clearLocalSession() {
  try {
    if (session) {
      session.store.dispatch(resetTicketPreview());
      await session.persistor.purge();
    }
  } catch (e) {
    capture(e);
  }
  try {
    clearSessionContent(window.localStorage);
  } catch (e) {
    // stockage indisponible : rien à effacer
  }
}
