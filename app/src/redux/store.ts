import { createStore, combineReducers } from "redux";
import reducers from "./reducers";
import * as Sentry from "@sentry/react";

const sentryReduxEnhancer = Sentry.createReduxEnhancer();

export default createStore(combineReducers({ ...reducers }), sentryReduxEnhancer);
