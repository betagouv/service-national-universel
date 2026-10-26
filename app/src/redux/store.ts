import { createStore, combineReducers, applyMiddleware } from "redux";
import reducers from "./reducers";
import thunk from "redux-thunk";

// Pas de Sentry.createReduxEnhancer : il joignait le state complet (profil du volontaire, santé, représentants légaux)
// à chaque événement Sentry.
export default createStore(combineReducers({ ...reducers }), applyMiddleware(thunk));
