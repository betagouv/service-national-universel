import { createStore, combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import reducers from "./reducers";

// Version du cache persisté. Un cache d'une autre version est écarté au démarrage : les aperçus de
// tickets mis en cache avant le filtrage des contenus (GOO-6) ne sont pas réhydratés.
const PERSIST_VERSION = 1;

const persistConfig = {
  key: "root",
  storage,
  version: PERSIST_VERSION,
  migrate: (state) => Promise.resolve(state?._persist?.version === PERSIST_VERSION ? state : undefined),
  whitelist: ["TicketPreview"], // only TicketPreview will be persisted
};

const persistedReducer = persistReducer(persistConfig, combineReducers({ ...reducers }));

export default () => {
  // Pas de Sentry.createReduxEnhancer : il joignait le state complet (tickets, messages, notes internes) à chaque événement.
  let store = createStore(persistedReducer);
  let persistor = persistStore(store);
  return { store, persistor };
};
