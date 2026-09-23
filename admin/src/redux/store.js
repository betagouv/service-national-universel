import { createStore, combineReducers } from "redux";
import reducers from "./reducers";

// Pas de Sentry.createReduxEnhancer : il joignait le state complet (utilisateur connecté, dossiers consultés)
// à chaque événement Sentry.
export default createStore(combineReducers({ ...reducers }));
