import { createStore, combineReducers } from "redux";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";

import reducers from "./reducers";
import { registerLocalSession } from "../services/localSession";

// Version du cache persisté. Un cache d'une autre version est écarté au démarrage : les aperçus de
// tickets mis en cache avant le filtrage des contenus (GOO-6) ne sont pas réhydratés.
const PERSIST_VERSION = 1;

// Les aperçus ouverts sont rechargés depuis l'API à l'affichage : seuls les en-têtes de ticket sont
// gardés en cache. Les fils de messages et la signature n'ont pas à séjourner dans le localStorage (FM21).
const withoutThreads = createTransform(
  (ticketPreview) => ({ ...ticketPreview, tickets: (ticketPreview?.tickets || []).map(({ messages, signature, ...rest }) => rest) }),
  (ticketPreview) => ticketPreview,
  { whitelist: ["TicketPreview"] }
);

const persistConfig = {
  key: "root",
  storage,
  version: PERSIST_VERSION,
  migrate: (state) => Promise.resolve(state?._persist?.version === PERSIST_VERSION ? state : undefined),
  whitelist: ["TicketPreview"], // only TicketPreview will be persisted
  transforms: [withoutThreads],
};

const persistedReducer = persistReducer(persistConfig, combineReducers({ ...reducers }));

export default () => {
  // Pas de Sentry.createReduxEnhancer : il joignait le state complet (tickets, messages, notes internes) à chaque événement.
  let store = createStore(persistedReducer);
  let persistor = persistStore(store);
  registerLocalSession({ store, persistor });
  return { store, persistor };
};
