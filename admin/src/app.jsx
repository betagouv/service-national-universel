import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Switch, Redirect, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
import Center from "./scenes/centersV2";
import Inscription from "./scenes/inscription";
import PointDeRassemblement from "./scenes/pointDeRassemblement";
import SupportCenter from "./scenes/support-center";
import Association from "./scenes/association";
import Inbox from "./scenes/inbox";
import CGU from "./scenes/CGU";
import PublicSupport from "./scenes/public-support-center";
import SessionShareIndex from "./scenes/session-phase1/index";
import TableDeRepartition from "./scenes/plan-transport/table-repartition";
import SchemaDeRepartition from "./scenes/plan-transport/schema-repartition";
import LigneBus from "./scenes/plan-transport/ligne-bus";
import EditTransport from "./scenes/edit-transport";
import DSNJExport from "./scenes/dsnj-export";
import DevelopAssetsPresentationPage from "./scenes/develop/AssetsPresentationPage";
import Etablissement from "./scenes/school";

//DashboardV2
import DashboardV2 from "./scenes/dashboardV2/moderator-ref";
import DashboardResponsibleV2 from "./scenes/dashboardV2/responsible";
import DashboardHeadCenterV2 from "./scenes/dashboardV2/head-center";
import DashboardVisitorV2 from "./scenes/dashboardV2/visitor";

import Drawer from "./components/drawer";
import Header from "./components/header";
import Footer from "./components/footer";
import Loader from "./components/Loader";

import api, { initApi } from "./services/api";
import { initSentry, SentryRoute, history } from "./sentry";

import { adminURL, environment } from "./config";
import { ROLES, ROLES_LIST, COHESION_STAY_END } from "./utils";

import "./index.css";
import ModalCGU from "./components/modals/ModalCGU";
import Team from "./scenes/team";
import * as Sentry from "@sentry/react";

import useDocumentTitle from "./hooks/useDocumentTitle";

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
          <Footer />
        </div>
      </Router>
    </Sentry.ErrorBoundary>
  );
}

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(true);

  const [drawerVisible, setDrawerVisible] = useState(false);

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
          return setLoading(false);
        }
        if (res.token) api.setToken(res.token);
        if (res.user) dispatch(setUser(res.user));
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
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
            }) || sessions[0];

          setSessionPhase1List(sessions.reverse());
          dispatch(setSessionPhase1(activeSession));
        } catch (e) {
          Sentry.captureException(e);
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

  return (
    <div>
      <Header onClickBurger={() => setDrawerVisible((e) => !e)} drawerVisible={drawerVisible} sessionsList={sessionPhase1List} />
      <div className="flex">
        <Drawer open={drawerVisible} onOpen={setDrawerVisible} />
        <div className={drawerVisible ? `flex-1 ml-[220px] min-h-screen` : `flex-1 lg:ml-[220px] min-h-screen`}>
          <Switch>
            <RestrictedRoute path="/structure" component={Structure} />
            <RestrictedRoute path="/settings" component={Settings} />
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
            {user?.subRole === "god" && <RestrictedRoute path="/edit-transport" component={EditTransport} />}
            {/* Table de répartition */}
            <RestrictedRoute path="/table-repartition" component={TableDeRepartition} />
            {/* Ligne de bus */}
            <RestrictedRoute path="/ligne-de-bus" component={LigneBus} />
            {/* Schéma de répartition */}
            <RestrictedRoute path="/schema-repartition/:region/:department" component={SchemaDeRepartition} />
            <RestrictedRoute path="/schema-repartition/:region" component={SchemaDeRepartition} />
            <RestrictedRoute path="/schema-repartition" component={SchemaDeRepartition} />
            {/* Only for developper eyes... */}
            {environment === "development" && <RestrictedRoute path="/develop-assets" component={DevelopAssetsPresentationPage} />}

            {/* DASHBOARD */}
            {environment === "production" && <RestrictedRoute path="/dashboard/:currentTab/:currentSubtab" component={renderDashboard} />}
            {environment === "production" && <RestrictedRoute path="/dashboard/:currentTab" component={renderDashboard} />}
            {environment === "production" && <RestrictedRoute path="/" component={renderDashboard} />}
            {environment !== "production" && <RestrictedRoute path="/dashboard" component={renderDashboardV2} />}
            {environment !== "production" && <RestrictedRoute path="/" component={renderDashboardV2} />}
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

const limitedAccess = {
  [ROLES.DSNJ]: { authorised: ["/dsnj-export", "/profil"], default: "/dsnj-export" },
  [ROLES.TRANSPORTER]: { authorised: ["/schema-repartition", "/profil", "/ligne-de-bus", "/centre", "/point-de-rassemblement"], default: "/schema-repartition" },
};

const RestrictedRoute = ({ component: Component, roles = ROLES_LIST, ...rest }) => {
  const { pathname } = useLocation();

  const user = useSelector((state) => state.Auth.user);
  if (!user) {
    const redirect = encodeURIComponent(window.location.href.replace(window.location.origin, "").substring(1));
    return <Redirect to={{ search: redirect && redirect !== "logout" ? `?redirect=${redirect}` : "", pathname: "/auth" }} />;
  }

  const matchRoute = limitedAccess[user.role]?.authorised.some((route) => pathname.includes(route));

  if (limitedAccess[user.role] && !matchRoute) {
    return <Redirect to={limitedAccess[user.role].default} />;
  }

  if (!roles.includes(user.role)) {
    return <Redirect to="/dashboard" />;
  }
  return <SentryRoute {...rest} render={(props) => <Component {...props} />} />;
};
