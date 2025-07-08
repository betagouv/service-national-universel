import { createStore, combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import * as Sentry from "@sentry/react";

import reducers from "./reducers";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["TicketPreview"], // only TicketPreview will be persisted
};

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options listed below
});

const persistedReducer = persistReducer(persistConfig, combineReducers({ ...reducers }));

export default () => {
  let store = createStore(persistedReducer, sentryReduxEnhancer);
  let persistor = persistStore(store);
  return { store, persistor };
};
