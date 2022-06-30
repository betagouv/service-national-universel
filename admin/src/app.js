import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

import { setUser, setSessionPhase1 } from "./redux/auth/actions";
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
import SupportCenter from "./scenes/support-center";
import Association from "./scenes/association";
import Inbox from "./scenes/inbox";
import CGU from "./scenes/CGU";
import PublicSupport from "./scenes/public-support-center";
import SessionShareIndex from "./scenes/session-phase1/index";
import { GoTools } from "react-icons/go";

import Drawer from "./components/drawer";
import Header from "./components/header";
import Footer from "./components/footer";
import Loader from "./components/Loader";
import Zammad from "./components/Zammad";

import api from "./services/api";

import { SENTRY_URL, environment, adminURL } from "./config";
import { ROLES, ROLES_LIST, COHESION_STAY_END } from "./utils";

import "./index.css";
import ModalCGU from "./components/modals/ModalCGU";
import Team from "./scenes/team";

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
        // const { data } = await api.get(`/zammad-support-center/ticket_overviews`);
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
          <Route path="/auth" component={Maintenance} />
          <Route path="/session-phase1-partage" component={SessionShareIndex} />
          <Route path="/public-besoin-d-aide" component={PublicSupport} />
          <Route path="/" component={Maintenance} />
          {/* <Route path="/" component={Home} /> */}
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

const Maintenance = () => (
  <div className="flex items-center justify-center h-full">
    <div className="bg-yellow-50 p-6 rounded-lg shadow-sm m-8 w-1/2">
      <div className="flex space-x-2 items-center">
        <GoTools className="text-yellow-600 text-lg" />
        <h5 className="text-yellow-600 text-xl">MAINTENANCE</h5>
      </div>
      <div className="text-yellow-900 py-6 text-lg">
        A cause de la très forte charge sur les serveurs du SNU, le site admin rencontre des difficultés importantes ce matin. Des mesures d&apos;urgence sont en cours. Le site
        sera à nouveau disponible à partir de 11h30.
      </div>
    </div>
  </div>
);

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const [drawerVisible, setDrawerVisible] = useState(false);

  // pour les chefs de centre, il faut afficher une seul session à la fois si il y en a plusieurs (peu importe le centre de cohésion)
  const [sessionPhase1List, setSessionPhase1List] = useState(null);

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

  useEffect(() => {
    if (user && user.acceptCGU !== "true") {
      setModal({
        isOpen: true,
        title: "Conditions générales d'utilisation",
        message: (
          <>
            <p>Les conditions générales d&apos;utilisation du SNU ont été mises à jour. Vous devez les accepter afin de continuer à accéder à votre compte SNU.</p>
            <a href={`${adminURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
              Consulter les CGU ›
            </a>
          </>
        ),
        onConfirm: async () => {
          await api.put(`/referent/${user._id}`, { acceptCGU: "true" });
        },
        confirmText: "J'accepte les conditions générales d'utilisation",
      });
    }
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    if (user.role !== ROLES.HEAD_CENTER) return;
    (async () => {
      const { ok, data, code } = await api.get(`/referent/${user._id}/session-phase1`);
      if (!ok) return console.log(`Error: ${code}`);

      const sessions = data.sort((a, b) => COHESION_STAY_END[a.cohort] - COHESION_STAY_END[b.cohort]);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // on regarde la session la plus proche dans le futur qui ne sait pas terminé il y a plus de 3 jours
      // i.e. une session est considérée terminée 3 jours après la date de fin du séjour
      const activeSession =
        sessions.find((s) => {
          const limit = COHESION_STAY_END[s.cohort].setDate(COHESION_STAY_END[s.cohort].getDate() + 3);
          return limit >= now;
        }) || sessions[0];

      setSessionPhase1List(sessions.reverse());
      dispatch(setSessionPhase1(activeSession));
    })();
  }, [user]);

  return (
    <div>
      <Header onClickBurger={() => setDrawerVisible((e) => !e)} drawerVisible={drawerVisible} sessionsList={sessionPhase1List} />
      <div className="flex">
        <Drawer open={drawerVisible} onOpen={setDrawerVisible} />
        <div className={drawerVisible ? `flex-1 ml-[220px] min-h-screen` : `flex-1 lg:ml-[220px] min-h-screen`}>
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
            <RestrictedRoute path="/besoin-d-aide" component={SupportCenter} />
            <RestrictedRoute path="/boite-de-reception" component={Inbox} />
            <RestrictedRoute path="/dashboard/:currentTab/:currentSubtab" component={renderDashboard} />
            <RestrictedRoute path="/dashboard/:currentTab" component={renderDashboard} />
            <RestrictedRoute path="/equipe" component={Team} />
            <RestrictedRoute path="/" component={renderDashboard} />
          </Switch>
        </div>
      </div>
      <ModalCGU
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        confirmText={modal?.confirmText}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
        onCancel={() => {
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
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
