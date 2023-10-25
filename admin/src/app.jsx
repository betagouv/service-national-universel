import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, BrowserRouter as Router, Switch, useLocation } from "react-router-dom";
import queryString from "query-string";

import { setSessionPhase1, setUser } from "./redux/auth/actions";
import CGU from "./scenes/CGU";
import Alerte from "./scenes/alerte";
import Association from "./scenes/association";
import Auth from "./scenes/auth";
import Center from "./scenes/centersV2";
import Content from "./scenes/content";
import Dashboard from "./scenes/dashboard";
import DashboardHeadCenter from "./scenes/dashboard-head-center";
import DashboardResponsible from "./scenes/dashboard-responsible";
import DashboardVisitor from "./scenes/dashboard-visitor";
import DevelopAssetsPresentationPage from "./scenes/develop/AssetsPresentationPage";
import DesignSystemPage from "./scenes/develop/DesignSystemPage";
import DSNJExport from "./scenes/dsnj-export";
import EditTransport from "./scenes/edit-transport";
import Goal from "./scenes/goal";
import Inbox from "./scenes/inbox";
import Inscription from "./scenes/inscription";
import Missions from "./scenes/missions";
import LigneBus from "./scenes/plan-transport/ligne-bus";
import SchemaDeRepartition from "./scenes/plan-transport/schema-repartition";
import TableDeRepartition from "./scenes/plan-transport/table-repartition";
import PointDeRassemblement from "./scenes/pointDeRassemblement";
import Profil from "./scenes/profil";
import PublicSupport from "./scenes/public-support-center";
import Etablissement from "./scenes/school";
import SessionShareIndex from "./scenes/session-phase1/index";
import Settings from "./scenes/settings";
import Structure from "./scenes/structure";
import SupportCenter from "./scenes/support-center";
import Utilisateur from "./scenes/utilisateur";
import Validate from "./scenes/validate";
import Volontaires from "./scenes/volontaires";
import VolontairesHeadCenter from "./scenes/volontaires-head-center";
import VolontairesResponsible from "./scenes/volontaires-responsible";

//DashboardV2
import DashboardHeadCenterV2 from "./scenes/dashboardV2/head-center";
import DashboardV2 from "./scenes/dashboardV2/moderator-ref";
import DashboardResponsibleV2 from "./scenes/dashboardV2/responsible";
import DashboardVisitorV2 from "./scenes/dashboardV2/visitor";

import Loader from "./components/Loader";
import Drawer from "./components/drawer";
import Footer from "./components/footer";
import Header from "./components/header";

import { SentryRoute, capture, history, initSentry } from "./sentry";
import api, { initApi } from "./services/api";

import { adminURL, environment } from "./config";
import { COHESION_STAY_END, ROLES, ROLES_LIST } from "./utils";
import { FEATURES_NAME, isFeatureEnabled } from "./features";

import * as Sentry from "@sentry/react";
import ModalCGU from "./components/modals/ModalCGU";
import "./index.css";
import Team from "./scenes/team";

import SideBar from "./components/drawer/SideBar";
import useDocumentTitle from "./hooks/useDocumentTitle";
import { getCohorts } from "./services/cohort.service";

initSentry();
initApi();

function FallbackComponent() {
  return <></>;
}

const myFallback = <FallbackComponent />;

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={myFallback}>
      <Router history={history}>
        <ScrollToTop />
        <div className="main">
          <Switch>
            {/* Aucune authentification nécessaire */}
            <SentryRoute path="/validate" component={Validate} />
            <SentryRoute path="/conditions-generales-utilisation" component={CGU} />
            <SentryRoute path="/session-phase1-partage" component={SessionShareIndex} />
            <SentryRoute path="/public-besoin-d-aide" component={PublicSupport} />
            {/* Authentification accessoire */}
            <SentryRoute path="/auth" component={Auth} />
            {/* Authentification nécessaire */}
            <SentryRoute path="/" component={Home} />
          </Switch>
        </div>
      </Router>
    </Sentry.ErrorBoundary>
  );
}

const Home = (props) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const { pathname, search } = useLocation();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(true);

  const [drawerVisible, setDrawerVisible] = useState(true);

  // pour les chefs de centre, il faut afficher une seul session à la fois si il y en a plusieurs (peu importe le centre de cohésion)
  const [sessionPhase1List, setSessionPhase1List] = useState(null);

  const renderDashboard = () => {
    useDocumentTitle("Tableau de bord");

    if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user?.role)) return <DashboardResponsible />;
    if (user?.role === ROLES.HEAD_CENTER) return <DashboardHeadCenter />;
    if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user?.role)) return <Dashboard />;
    if (user?.role === ROLES.VISITOR) return <DashboardVisitor />;
    return null;
  };

  const renderDashboardV2 = () => {
    if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user?.role)) return <DashboardV2 />;
    if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user?.role)) return <DashboardResponsibleV2 />;
    if (user?.role === ROLES.HEAD_CENTER) return <DashboardHeadCenterV2 />;
    if (user?.role === ROLES.VISITOR) return <DashboardVisitorV2 />;
    return null;
  };

  const renderVolontaire = () => {
    if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user?.role)) return <VolontairesResponsible />;
    if (user?.role === ROLES.HEAD_CENTER) return <VolontairesHeadCenter />;
    if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user?.role)) return <Volontaires />;
    return null;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.checkToken();
        if (!res.ok || !res.user) {
          api.setToken(null);
          dispatch(setUser(null));
          setLoading(false);
        }
        if (res.token) api.setToken(res.token);
        if (res.user) dispatch(setUser(res.user));
        const cohorts = await getCohorts();
        if (cohorts) dispatch({ type: "SET_COHORTS", payload: cohorts });

        //Load session phase 1 for head center before stop loading
        if (res.user.role !== ROLES.HEAD_CENTER) setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) return;

    if (user.role === ROLES.HEAD_CENTER) {
      (async () => {
        try {
          const { ok, data, code } = await api.get(`/referent/${user._id}/session-phase1?with_cohesion_center=true`);
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
            }) || sessions[sessions.length - 1];

          setSessionPhase1List(sessions.reverse());
          dispatch(setSessionPhase1(activeSession));
          setLoading(false);
        } catch (e) {
          capture(e);
        }
      })();
    }

    if (user.acceptCGU !== "true") {
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

  if (loading) return <Loader />;
  if (!user) {
    const queryObject = { disconnected: 1 };
    if (pathname) queryObject.redirect = `${pathname}${search}`;

    return <Redirect to={`/auth?${queryString.stringify(queryObject)}`} />;
  }

  return (
    <div>
      {!isFeatureEnabled(FEATURES_NAME.SIDEBAR, user?.role) ? (
        <Header onClickBurger={() => setDrawerVisible((e) => !e)} drawerVisible={drawerVisible} sessionsList={sessionPhase1List} />
      ) : null}
      <div className="flex">
        {!isFeatureEnabled(FEATURES_NAME.SIDEBAR, user?.role) ? <Drawer open={drawerVisible} onOpen={setDrawerVisible} /> : <SideBar sessionsList={sessionPhase1List} />}
        <div className="flex flex-col w-full">
          <div
            className={
              !isFeatureEnabled(FEATURES_NAME.SIDEBAR, user?.role)
                ? drawerVisible
                  ? `flex-1 ml-[220px] min-h-screen`
                  : `flex-1 lg:ml-[220px] min-h-screen`
                : `flex-1  min-h-screen`
            }>
            <Switch>
              <RestrictedRoute path="/structure" component={Structure} />
              <RestrictedRoute path="/settings" component={Settings} />
              <RestrictedRoute path="/alerte" component={Alerte} />
              <RestrictedRoute path="/profil" component={Profil} />
              <RestrictedRoute path="/volontaire" component={renderVolontaire} />
              <RestrictedRoute path="/etablissement" component={Etablissement} />
              <RestrictedRoute path="/mission" component={Missions} />
              <RestrictedRoute path="/inscription" component={Inscription} />
              <RestrictedRoute path="/user" component={Utilisateur} />
              <RestrictedRoute path="/contenu" component={Content} />
              <RestrictedRoute path="/objectifs" component={Goal} roles={[ROLES.ADMIN]} />
              <RestrictedRoute path="/centre" component={Center} />
              <RestrictedRoute path="/point-de-rassemblement" component={PointDeRassemblement} />
              <RestrictedRoute path="/association" component={Association} />
              <RestrictedRoute path="/besoin-d-aide" component={SupportCenter} />
              <RestrictedRoute path="/boite-de-reception" component={Inbox} />
              <RestrictedRoute path="/equipe" component={Team} />
              <RestrictedRoute path="/dsnj-export" component={DSNJExport} />
              {/* Plan de transport */}
              {user?.role === "admin" && user?.subRole === "god" ? <RestrictedRoute path="/edit-transport" component={EditTransport} /> : null}
              {/* Table de répartition */}
              <RestrictedRoute path="/table-repartition" component={TableDeRepartition} />
              {/* Ligne de bus */}
              <RestrictedRoute path="/ligne-de-bus" component={LigneBus} />
              {/* Schéma de répartition */}
              <RestrictedRoute path="/schema-repartition/:region/:department" component={SchemaDeRepartition} />
              <RestrictedRoute path="/schema-repartition/:region" component={SchemaDeRepartition} />
              <RestrictedRoute path="/schema-repartition" component={SchemaDeRepartition} />
              {/* Only for developper eyes... */}
              {environment === "development" ? <RestrictedRoute path="/develop-assets" component={DevelopAssetsPresentationPage} /> : null}
              {environment === "development" ? <RestrictedRoute path="/design-system" component={DesignSystemPage} /> : null}
              {/* DASHBOARD */}
              {!isFeatureEnabled(FEATURES_NAME.DASHBOARD, user?.role) && <RestrictedRoute path="/dashboard/:currentTab/:currentSubtab" component={renderDashboard} />}
              {!isFeatureEnabled(FEATURES_NAME.DASHBOARD, user?.role) && <RestrictedRoute path="/dashboard/:currentTab" component={renderDashboard} />}
              {!isFeatureEnabled(FEATURES_NAME.DASHBOARD, user?.role) && <RestrictedRoute path="/" component={renderDashboard} />}
              {isFeatureEnabled(FEATURES_NAME.DASHBOARD, user?.role) && <RestrictedRoute path="/dashboard" component={renderDashboardV2} />}
              {isFeatureEnabled(FEATURES_NAME.DASHBOARD, user?.role) && <RestrictedRoute path="/" component={renderDashboardV2} />}
            </Switch>
          </div>
          <Footer />
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

const limitedAccess = {
  [ROLES.DSNJ]: { authorised: ["/dsnj-export", "/profil"], default: "/dsnj-export" },
  [ROLES.TRANSPORTER]: { authorised: ["/schema-repartition", "/profil", "/ligne-de-bus", "/centre", "/point-de-rassemblement"], default: "/schema-repartition" },
};

const RestrictedRoute = ({ component: Component, roles = ROLES_LIST, ...rest }) => {
  const { pathname } = useLocation();
  const user = useSelector((state) => state.Auth.user);

  const matchRoute = limitedAccess[user.role]?.authorised.some((route) => pathname.includes(route));

  if (limitedAccess[user.role] && !matchRoute) {
    return <Redirect to={limitedAccess[user.role].default} />;
  }

  if (!roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }
  return <SentryRoute {...rest} render={(props) => <Component {...props} />} />;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
