import { createStore, combineReducers, applyMiddleware } from "redux";
import reducers from "./reducers";
import * as Sentry from "@sentry/react";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";

const sentryReduxEnhancer = Sentry.createReduxEnhancer();

export default createStore(combineReducers({ ...reducers }), composeWithDevTools(applyMiddleware(thunk), sentryReduxEnhancer));
