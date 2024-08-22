import { SentryRoute, capture, history, initSentry } from "./sentry";
initSentry();

import "bootstrap/dist/css/bootstrap.min.css";
import queryString from "query-string";
import React, { useEffect, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, BrowserRouter as Router, Switch, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { isFeatureEnabled, FEATURES_NAME } from "snu-lib";
import * as Sentry from "@sentry/react";

import { queryClient } from "./services/react-query";
import { setSessionPhase1, setUser } from "./redux/auth/actions";

const Alerte = lazy(() => import("./scenes/alerte"));
const Association = lazy(() => import("./scenes/association"));
const Center = lazy(() => import("./scenes/centersV2"));
const Content = lazy(() => import("./scenes/content"));
const DevelopAssetsPresentationPage = lazy(() => import("./scenes/develop/AssetsPresentationPage"));
const DesignSystemPage = lazy(() => import("./scenes/develop/DesignSystemPage"));
const DSNJExport = lazy(() => import("./scenes/dsnj-export"));
const EditTransport = lazy(() => import("./scenes/edit-transport"));
const Goal = lazy(() => import("./scenes/goal"));
const Inscription = lazy(() => import("./scenes/inscription"));
const Missions = lazy(() => import("./scenes/missions"));
const LigneBus = lazy(() => import("./scenes/plan-transport/ligne-bus"));
const SchemaDeRepartition = lazy(() => import("./scenes/plan-transport/schema-repartition"));
const TableDeRepartition = lazy(() => import("./scenes/plan-transport/table-repartition"));
const PointDeRassemblement = lazy(() => import("./scenes/pointDeRassemblement"));
const Profil = lazy(() => import("./scenes/profil"));
const School = lazy(() => import("./scenes/school"));
const Settings = lazy(() => import("./scenes/settings"));
const Structure = lazy(() => import("./scenes/structure"));
const SupportCenter = lazy(() => import("./scenes/support-center"));
const Team = lazy(() => import("./scenes/team"));
const Utilisateur = lazy(() => import("./scenes/utilisateur"));
const Volontaires = lazy(() => import("./scenes/volontaires"));
const VolontairesHeadCenter = lazy(() => import("./scenes/volontaires-head-center"));
const VolontairesResponsible = lazy(() => import("./scenes/volontaires-responsible"));
const Etablissement = lazy(() => import("./scenes/etablissement"));
const Classe = lazy(() => import("./scenes/classe"));
const VolontaireCle = lazy(() => import("./scenes/volontaire-cle"));
const Contact = lazy(() => import("./scenes/contact"));

//DashboardV2
const DashboardHeadCenterV2 = lazy(() => import("./scenes/dashboardV2/head-center"));
const DashboardV2 = lazy(() => import("./scenes/dashboardV2/moderator-ref"));
const DashboardResponsibleV2 = lazy(() => import("./scenes/dashboardV2/responsible"));
const DashboardVisitorV2 = lazy(() => import("./scenes/dashboardV2/visitor"));

const Loader = lazy(() => import("./components/Loader"));
const Footer = lazy(() => import("./components/footer"));
const ModalCGU = lazy(() => import("./components/modals/ModalCGU"));
const RestorePreviousSignin = lazy(() => import("./components/RestorePreviousSignin"));
const SideBar = lazy(() => import("./components/drawer/SideBar"));
const ApplicationError = lazy(() => import("./components/layout/ApplicationError"));
const NotFound = lazy(() => import("./components/layout/NotFound"));

const Validate = lazy(() => import("./scenes/validate"));
const CGU = lazy(() => import("./scenes/CGU"));
const SessionShareIndex = lazy(() => import("./scenes/session-phase1/index"));
const PublicSupport = lazy(() => import("./scenes/public-support-center"));
const Signup = lazy(() => import("./scenes/signup"));
const Auth = lazy(() => import("./scenes/auth"));

import api, { initApi } from "./services/api";
import { adminURL, environment } from "./config";
import { getDefaultSession } from "./utils/session";
import { ROLES, ROLES_LIST } from "./utils";
import { getCohorts } from "./services/cohort.service";
import { COHORTS_ACTIONS } from "./redux/cohorts/actions";
import useRefreshToken from "./hooks/useRefreshToken";

initApi();

class App extends React.Component {
  render() {
    return (
      <Sentry.ErrorBoundary fallback={ApplicationError}>
        <QueryClientProvider client={queryClient}>
          <Router history={history}>
            <ScrollToTop />
            <div className="main">
              <Suspense fallback={<Loader />}>
                <Switch>
                  {/* Aucune authentification nécessaire */}
                  <SentryRoute path="/validate" component={Validate} />
                  <SentryRoute path="/conditions-generales-utilisation" component={CGU} />
                  <SentryRoute path="/session-phase1-partage" component={SessionShareIndex} />
                  <SentryRoute path="/public-besoin-d-aide" component={PublicSupport} />
                  <SentryRoute path="/creer-mon-compte" component={Signup} />
                  <SentryRoute path="/verifier-mon-compte" component={Signup} />
                  {/* Authentification accessoire */}
                  <SentryRoute path="/auth" component={Auth} />
                  {/* Page par default (404 et Home) */}
                  <SentryRoute path="/" component={Home} />
                </Switch>
              </Suspense>
            </div>
          </Router>
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    );
  }
}

export default Sentry.withProfiler(App);

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Auth.cohorts);
  const { pathname, search } = useLocation();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [loading, setLoading] = useState(true);

  // pour les chefs de centre, il faut afficher une seul session à la fois si il y en a plusieurs (peu importe le centre de cohésion)
  const [sessionPhase1List, setSessionPhase1List] = useState(null);

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
    if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user?.role)) return <Volontaires />;
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
        if (cohorts) dispatch({ type: COHORTS_ACTIONS.SET_COHORTS, payload: cohorts });

        //Load session phase 1 for head center before stop loading
        if (res.user?.role !== ROLES.HEAD_CENTER) setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useRefreshToken();

  useEffect(() => {
    if (!user) return;

    if (user.role === ROLES.HEAD_CENTER) {
      (async () => {
        try {
          const { ok, data, code } = await api.get(`/referent/${user._id}/session-phase1?with_cohesion_center=true`);
          if (!ok) return console.log(`Error: ${code}`);

          const sessions = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          const activeSession = getDefaultSession(sessions, cohorts);

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
      <RestorePreviousSignin />

      <div className="flex">
        <SideBar sessionsList={sessionPhase1List} />
        <div className="flex flex-col w-full">
          <div className={`flex-1  min-h-screen`}>
            <Sentry.ErrorBoundary fallback={ApplicationError}>
              <Suspense fallback={<Loader />}>
                <Switch>
                  <RestrictedRoute path="/structure" component={Structure} />
                  <RestrictedRoute path="/settings" component={Settings} />
                  <RestrictedRoute path="/alerte" component={Alerte} />
                  <RestrictedRoute path="/profil" component={Profil} />
                  <RestrictedRoute path="/volontaire" component={renderVolontaire} />
                  <RestrictedRoute path="/school" component={School} />
                  <RestrictedRoute path="/mission" component={Missions} />
                  <RestrictedRoute path="/inscription" component={Inscription} />
                  <RestrictedRoute path="/user" component={Utilisateur} />
                  <RestrictedRoute path="/contenu" component={Content} />
                  <RestrictedRoute path="/objectifs" component={Goal} roles={[ROLES.ADMIN]} />
                  <RestrictedRoute path="/centre" component={Center} />
                  <RestrictedRoute path="/point-de-rassemblement" component={PointDeRassemblement} />
                  <RestrictedRoute path="/association" component={Association} />
                  <RestrictedRoute path="/besoin-d-aide" component={SupportCenter} />
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
                  {/* Institution */}
                  <RestrictedRoute path="/mon-etablissement" component={Etablissement} />
                  <RestrictedRoute path="/etablissement" component={Etablissement} />

                  <RestrictedRoute path="/classes" component={Classe} />
                  <RestrictedRoute path="/mes-eleves" component={VolontaireCle} />
                  <RestrictedRoute path="/mes-contacts" component={Contact} />
                  {/* Only for developper eyes... */}
                  {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, user?.role, environment) ? (
                    <RestrictedRoute path="/develop-assets" component={DevelopAssetsPresentationPage} />
                  ) : null}
                  {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, user?.role, environment) ? <RestrictedRoute path="/design-system" component={DesignSystemPage} /> : null}
                  {/* DASHBOARD */}
                  <RestrictedRoute path="/dashboard" component={renderDashboardV2} />
                  {/* Default route (redirection de la home et 404) */}
                  <RestrictedRoute path="/" component={(props) => <NotFound {...props} homePath="/dashboard" />} />
                </Switch>
              </Suspense>
            </Sentry.ErrorBoundary>
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
  [ROLES.TRANSPORTER]: { authorised: ["/schema-repartition", "/profil", "/ligne-de-bus", "/centre", "/point-de-rassemblement", "/besoin-d-aide"], default: "/schema-repartition" },
  // FIXME [CLE]: remove dev routes when
  [ROLES.ADMINISTRATEUR_CLE]: {
    authorised: ["/mon-etablissement", "/classes", "/mes-eleves", "/design-system", "/develop-assets", "/user", "/profil", "/volontaire", "/besoin-d-aide"],
    default: "/mon-etablissement",
  },
  [ROLES.REFERENT_CLASSE]: {
    authorised: ["/mon-etablissement", "/classes", "/mes-eleves", "/design-system", "/develop-assets", "/user", "/profil", "/volontaire", "/besoin-d-aide"],
    default: "/mon-etablissement",
  },
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
