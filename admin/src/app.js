import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Sentry from "@sentry/browser";
import styled from "styled-components";

import { setUser, setStructure } from "./redux/auth/actions";

import Auth from "./scenes/auth";
import Validate from "./scenes/validate";
import Profil from "./scenes/profil";
import Settings from "./scenes/settings";
import Dashboard from "./scenes/dashboard";
import DashboardResponsible from "./scenes/dashboard-responsible";
import DashboardHeadCenter from "./scenes/dashboard-head-center";
import Structure from "./scenes/structure";
import Missions from "./scenes/missions";
import Volontaires from "./scenes/volontaires";
import VolontairesResponsible from "./scenes/volontaires-responsible";
import VolontairesHeadCenter from "./scenes/volontaires-head-center";
import Utilisateur from "./scenes/utilisateur";
import Content from "./scenes/content";
import Goal from "./scenes/goal";
import Center from "./scenes/centers";
import Inscription from "./scenes/inscription";
import MeetingPoint from "./scenes/meetingPoint";

import Drawer from "./components/drawer";
import Header from "./components/header";
import Footer from "./components/footer";
import Loader from "./components/Loader";

import api from "./services/api";

import { SENTRY_URL, environment } from "./config";

import "./index.css";

if (environment === "production") Sentry.init({ dsn: SENTRY_URL, environment: "admin" });

export default () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    async function fetchData() {
      try {
        if (window.location.href.indexOf("/auth") !== -1) return setLoading(false);

        const res = await api.get("/referent/signin_token");
        if (!res.ok || !res.user) return setLoading(false);
        if (res.token) api.setToken(res.token);
        // const { data: structure, ok } = await api.get(`/structure`);
        if (res.user) dispatch(setUser(res.user));
        // if (structure) dispatch(setStructure(structure));
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <Router>
      <div className="main">
        <Switch>
          <Route path="/validate" component={Validate} />
          <Route path="/auth" component={Auth} />
          <Route path="/" component={Home} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
};

const Home = () => {
  const user = useSelector((state) => state.Auth.user);
  const [menuVisible, setMenuVisible] = useState(false);

  const renderDashboard = () => {
    if (["supervisor", "responsible"].includes(user?.role)) return <DashboardResponsible />;
    if (user?.role === "head_center") return <DashboardHeadCenter />;
    if (["referent_department", "referent_region", "admin"].includes(user?.role)) return <Dashboard />;
    return null;
  };
  const renderVolontaire = () => {
    if (["supervisor", "responsible"].includes(user?.role)) return <VolontairesResponsible />;
    if (user?.role === "head_center") return <VolontairesHeadCenter />;
    if (["referent_department", "referent_region", "admin"].includes(user?.role)) return <Volontaires />;
    return null;
  };

  return (
    <div style={{ display: "flex" }}>
      <Drawer open={menuVisible} onOpen={setMenuVisible} />
      <ContentContainer>
        <Header
          onClickBurger={() => {
            setMenuVisible(!menuVisible);
          }}
        />
        <Switch>
          <Route path="/auth" component={Auth} />
          <RestrictedRoute path="/structure" component={Structure} />
          <RestrictedRoute path="/settings" component={Settings} />
          <RestrictedRoute path="/profil" component={Profil} />
          <RestrictedRoute path="/volontaire" component={renderVolontaire} />
          <RestrictedRoute path="/mission" component={Missions} />
          <RestrictedRoute path="/inscription" component={Inscription} />
          <RestrictedRoute path="/user" component={Utilisateur} />
          <RestrictedRoute path="/contenu" component={Content} />
          <RestrictedRoute path="/objectifs" component={Goal} />
          <RestrictedRoute path="/centre" component={Center} />
          <RestrictedRoute path="/point-de-rassemblement" component={MeetingPoint} />
          <RestrictedRoute path="/" component={renderDashboard} />
        </Switch>
      </ContentContainer>
    </div>
  );
};

const RestrictedRoute = ({ component: Component, isLoggedIn, ...rest }) => {
  const user = useSelector((state) => state.Auth.user);
  if (!user) {
    const redirect = encodeURIComponent(window.location.href.replace(window.location.origin, "").substring(1));
    return <Redirect to={{ search: redirect && redirect !== "logout" ? `?redirect=${redirect}` : "", pathname: "/auth" }} />;
  }
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const ContentContainer = styled.div`
  margin-left: auto;
  width: 85%;
  max-width: calc(100% - 250px);
  @media (max-width: 768px) {
    width: 100%;
    padding: 0;
    margin-left: auto;
    max-width: 100%;
  }
`;
