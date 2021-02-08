import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Sentry from "@sentry/browser";

import { setUser, setStructure } from "./redux/auth/actions";

import Auth from "./scenes/auth";
import Onboarding from "./scenes/onboarding";

import Profil from "./scenes/profil";
import Settings from "./scenes/settings";

import Dashboard from "./scenes/dashboard";
import Structure from "./scenes/structure";
import Missions from "./scenes/missions";
import Volontaires from "./scenes/volontaires";
import Tuteur from "./scenes/tuteur";
import Utilisateur from "./scenes/utilisateur";

import Inscription from "./scenes/inscription";

import Team from "./scenes/team";

import Drawer from "./components/drawer";
import Header from "./components/header";

import api from "./services/api";

import { SENTRY_URL, environment } from "./config";

import matomo from "./services/matomo";

import "./index.css";

if (environment === "production") Sentry.init({ dsn: SENTRY_URL, environment: "admin" });

export default () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    matomo.logEvent("start", "open_app");
    async function fetchData() {
      try {
        if (window.location.href.indexOf("/auth") !== -1) return setLoading(false);

        const res = await api.get("/referent/signin_token");
        if (!res.ok || !res.user) return setLoading(false);
        if (res.token) api.setToken(res.token);
        // const { data: structure, ok } = await api.get(`/structure`);
        if (res.user) dispatch(setUser(res.user));
        matomo.setUserId(res.user._id);
        // if (structure) dispatch(setStructure(structure));
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Router>
        <Home />
      </Router>
    </div>
  );
};

const Home = () => {
  const user = useSelector((state) => state.Auth.user);
  // if (user && !user.structureId) return <Onboarding />;
  return (
    <div className="main">
      <Drawer />
      <div className="screen-container" style={{ marginLeft: !user && 0 }}>
        <Header />
        <Switch>
          <Route path="/auth" component={Auth} />
          <Route path="/onboarding" component={Onboarding} />
          <RestrictedRoute path="/structure" component={Structure} />
          <RestrictedRoute path="/settings" component={Settings} />
          <RestrictedRoute path="/profil" component={Profil} />
          <RestrictedRoute path="/team" component={Team} />
          <RestrictedRoute path="/volontaire" component={Volontaires} />
          <RestrictedRoute path="/tuteur" component={Tuteur} />
          <RestrictedRoute path="/mission" component={Missions} />
          <RestrictedRoute path="/inscription" component={Inscription} />
          <RestrictedRoute path="/user" component={Utilisateur} />
          <RestrictedRoute path="/" component={Dashboard} />
        </Switch>
      </div>
    </div>
  );
};

const RestrictedRoute = ({ component: Component, isLoggedIn, ...rest }) => {
  const user = useSelector((state) => state.Auth.user);
  if (!user) return <Redirect to={{ pathname: "/auth" }} />;
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};
