import React, { useEffect, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Router, Redirect, Switch, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const Auth = lazy(() => import("./scenes/auth"));
const Dashboard = lazy(() => import("./scenes/dashboard"));
const Profil = lazy(() => import("./scenes/profil"));
const Settings = lazy(() => import("./scenes/setting"));
const Ticket = lazy(() => import("./scenes/ticket"));
import API, { initApi } from "./services/api";

import ErrorPageUnknown from "./components/ErrorPageUnknown";
import ErrorPageNotFound from "./components/ErrorPageNotFound";

import Loader from "./components/Loader";
import { setOrganisation, setUser } from "./redux/auth/actions";
const KnowledgeBase = lazy(() => import("./scenes/knowledge-base"));
const CrudIndex = lazy(() => import("./scenes/crud/crudIndex"));

import { initSentry, SentryRoute, history } from "./sentry";
import * as Sentry from "@sentry/react";
import { getDocumentTitle } from "./utils";

initSentry();
initApi();

function FallbackComponent() {
  return <ErrorPageUnknown />;
}

const myFallback = <FallbackComponent />;

export default function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = getDocumentTitle();
  }, []);

  const { user } = useSelector((state) => state.Auth);

  // return <button onClick={methodDoesNotExist}>Break the world</button>;

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get({ path: "/agent/me" });
        if (!res.ok || !res.user) {
          dispatch(setUser(null));
          dispatch(setOrganisation(null));
          API.setToken("");
          return setLoading(false);
        }
        if (res.token) API.setToken(res.token);
        if (res.user) dispatch(setUser(res.user));
        if (res.organisation) dispatch(setOrganisation(res.organisation));
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader />;

  return (
    <Sentry.ErrorBoundary fallback={myFallback} showDialog>
      <Router history={history}>
        <div className="flex h-full w-full">
          {user && <Sidebar user={user} />}
          <div className="flex h-full flex-1 flex-col overflow-auto">
            <Suspense fallback={<Loader />}>
              <Switch>
                <Route path="/auth" component={Auth} />
                <RestrictedRoute withCreateTicketTopbar path="/ticket" component={Ticket} />
                <RestrictedRoute withCreateTicketTopbar path="/setting" component={Settings} />
                {user?.role === "AGENT" && <RestrictedRoute path="/knowledge-base/:slug" component={KnowledgeBase} />}
                {user?.role === "AGENT" && <RestrictedRoute path="/knowledge-base" component={KnowledgeBase} exact />}
                {user?.role === "AGENT" && <RestrictedRoute withCreateTicketTopbar path="/profil" component={Profil} />}
                {user?.role === "AGENT" && <RestrictedRoute path="/agents" component={CrudIndex} />}
                <RestrictedRoute withCreateTicketTopbar path="/" component={Dashboard} exact />
                <Route component={ErrorPageNotFound} />
              </Switch>
            </Suspense>
          </div>
        </div>
      </Router>
    </Sentry.ErrorBoundary>
  );
}

const RestrictedRoute = ({ withCreateTicketTopbar, component: Component, ...rest }) => {
  const user = useSelector((state) => state.Auth.user);
  if (user) {
    if (user.role === "DG" && (rest.path === "/" || rest.path === "/setting")) {
      return <Redirect to={{ pathname: "/ticket" }} />;
    }
    return (
      <SentryRoute
        {...rest}
        render={(props) => (
          <>
            {!!withCreateTicketTopbar && <Topbar />}
            <Component {...props} />
          </>
        )}
      />
    );
  }
  return <SentryRoute {...rest} render={() => <Redirect to={{ pathname: "/auth" }} />} />;
};
