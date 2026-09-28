import { createStore, combineReducers } from "redux";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";

import reducers from "./reducers";
import { registerLocalSession } from "../services/localSession";
import { toPersistedTicketPreview } from "../utils/ticketPreviewCache";

// Version du cache persisté. Un cache d'une autre version est écarté au démarrage : ceux des versions
// précédentes contiennent des documents ticket complets (GOO-6, puis FM21/PM55) et ne sont pas réhydratés.
const PERSIST_VERSION = 2;

// Les aperçus ouverts sont rechargés depuis l'API à l'affichage : le localStorage n'en garde que les
// identifiants et champs d'en-tête, dans les deux sens (écriture et réhydratation).
const headersOnly = createTransform(toPersistedTicketPreview, toPersistedTicketPreview, { whitelist: ["TicketPreview"] });

const persistConfig = {
  key: "root",
  storage,
  version: PERSIST_VERSION,
  migrate: (state) => Promise.resolve(state?._persist?.version === PERSIST_VERSION ? state : undefined),
  whitelist: ["TicketPreview"], // only TicketPreview will be persisted
  transforms: [headersOnly],
};

const persistedReducer = persistReducer(persistConfig, combineReducers({ ...reducers }));

export default () => {
  // Pas de Sentry.createReduxEnhancer : il joignait le state complet (tickets, messages, notes internes) à chaque événement.
  let store = createStore(persistedReducer);
  let persistor = persistStore(store);
  registerLocalSession({ store, persistor });
  return { store, persistor };
};
