import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import styled from "styled-components";

import { setUser } from "./redux/auth/actions";
import Auth from "./scenes/auth";
import Validate from "./scenes/validate";
import Profil from "./scenes/profil";
import Settings from "./scenes/settings";
import Dashboard from "./scenes/dashboard";
import DashboardVisitor from "./scenes/dashboard-visitor";
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
//import SupportCenter from "./scenes/support-center";
import Association from "./scenes/association";
//import Inbox from "./scenes/inbox";
import CGU from "./scenes/CGU";
//import PublicSupport from "./scenes/public-support-center";
import SupportMaintenance from "./scenes/support-center-maintenance";

import Drawer from "./components/drawer";
import Header from "./components/header";
import Footer from "./components/footer";
import Loader from "./components/Loader";
import Zammad from "./components/Zammad";

import api from "./services/api";

import { SENTRY_URL, environment } from "./config";
import { ROLES, ROLES_LIST } from "./utils";

import "./index.css";

if (environment === "production") {
  Sentry.init({
    dsn: SENTRY_URL,
    environment: "admin",
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    async function fetchData() {
      try {
        if (window.location.href.indexOf("/auth") !== -1) return setLoading(false);
        const res = await api.get("/referent/signin_token");
        if (!res.ok || !res.user) return setLoading(false);
        if (res.token) api.setToken(res.token);
        if (res.user) dispatch(setUser(res.user));
        // const { data } = await api.get(`/support-center/ticket_overviews`);
        // dispatch(setTickets(data));
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
      <Zammad />
      <div className="main">
        <Switch>
          <Route path="/validate" component={Validate} />
          <Route path="/conditions-generales-utilisation" component={CGU} />
          <Route path="/auth" component={Auth} />
          <Route path="/public-besoin-d-aide" component={SupportMaintenance} />
          <Route path="/" component={Home} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

const Home = () => {
  const user = useSelector((state) => state.Auth.user);

  const [menuVisible, setMenuVisible] = useState(false);

  const renderDashboard = () => {
    if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user?.role)) return <DashboardResponsible />;
    if (user?.role === ROLES.HEAD_CENTER) return <DashboardHeadCenter />;
    if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user?.role)) return <Dashboard />;
    if (user?.role === ROLES.VISITOR) return <DashboardVisitor />;
    return null;
  };
  const renderVolontaire = () => {
    if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user?.role)) return <VolontairesResponsible />;
    if (user?.role === ROLES.HEAD_CENTER) return <VolontairesHeadCenter />;
    if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user?.role)) return <Volontaires />;
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
          <RestrictedRoute path="/objectifs" component={Goal} roles={[ROLES.ADMIN]} />
          <RestrictedRoute path="/centre" component={Center} />
          <RestrictedRoute path="/point-de-rassemblement" component={MeetingPoint} />
          <RestrictedRoute path="/association" component={Association} />
          <RestrictedRoute path="/besoin-d-aide" component={SupportMaintenance} />
          <RestrictedRoute path="/boite-de-reception" component={SupportMaintenance} />
          <RestrictedRoute path="/dashboard/:currentTab/:currentSubtab" component={renderDashboard} />
          <RestrictedRoute path="/dashboard/:currentTab" component={renderDashboard} />
          <RestrictedRoute path="/" component={renderDashboard} />
        </Switch>
      </ContentContainer>
    </div>
  );
};

const RestrictedRoute = ({ component: Component, roles = ROLES_LIST, ...rest }) => {
  const user = useSelector((state) => state.Auth.user);
  if (!user) {
    const redirect = encodeURIComponent(window.location.href.replace(window.location.origin, "").substring(1));
    return <Redirect to={{ search: redirect && redirect !== "logout" ? `?redirect=${redirect}` : "", pathname: "/auth" }} />;
  }
  if (!roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const ContentContainer = styled.div`
  margin-left: auto;
  width: 85%;
  max-width: calc(100% - 250px);
  @media (max-width: 1000px) {
    width: 100%;
    padding: 0;
    margin-left: auto;
    max-width: 100%;
  }
`;
