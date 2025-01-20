import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import reducers from "./reducers";
import * as Sentry from "@sentry/react";
import thunk from "redux-thunk";

const sentryReduxEnhancer = Sentry.createReduxEnhancer();
const enhancer = compose(applyMiddleware(thunk), sentryReduxEnhancer);

export default createStore(combineReducers({ ...reducers }), enhancer);
