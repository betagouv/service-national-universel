import { SentryRoute, capture, history, initSentry } from "./sentry";
initSentry();

import "bootstrap/dist/css/bootstrap.min.css";
import queryString from "query-string";
import React, { useEffect, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, BrowserRouter as Router, Switch, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  isFeatureEnabled,
  FEATURES_NAME,
  SUB_ROLE_GOD,
  ROLES,
  isWriteAuthorized,
  PERMISSION_RESOURCES,
  isResponsibleOrSupervisor,
  isReferentOrAdmin,
  isResponsableDeCentre,
  isVisiteur,
  isAdminCle,
  isReferentClasse,
} from "snu-lib";
import * as Sentry from "@sentry/react";
import { getImpersonationChannel } from "./utils/broadcastChannel";

import { queryClient } from "./services/react-query";
import { setSessionPhase1, setUser } from "./redux/auth/actions";
import { RestrictedRoute } from "./components/layout/RestrictedRoute";

import Loader from "./components/Loader";
import Footer from "./components/footer";

import api, { initApi, setJwtToken } from "./services/api";

import { adminURL, environment } from "./config";

import ModalCGU from "./components/modals/ModalCGU";
import "./index.css";

import { getCohorts } from "./services/cohort.service";
import RestorePreviousSigninFlag from "./components/RestorePreviousSignin";
import useRefreshToken from "./hooks/useRefreshToken";

import SideBar from "./components/drawer/SideBar";
import ApplicationError from "./components/layout/ApplicationError";
import NotFound from "./components/layout/NotFound";
import { getDefaultSession } from "./utils/session";
import { COHORTS_ACTIONS } from "./redux/cohorts/actions";
import EmailPreview from "./scenes/email-preview";
import { ScrollToTop } from "./utils/router";
import { AuthState } from "./redux/auth/reducer";
import { CohortState } from "./redux/cohorts/reducer";

// @ts-ignore
const CGU = lazy(() => import("./scenes/CGU"));
// @ts-ignore
const Alerte = lazy(() => import("./scenes/alerte"));
// @ts-ignore
const Association = lazy(() => import("./scenes/association"));
// @ts-ignore
const Auth = lazy(() => import("./scenes/auth"));
// @ts-ignore
const Center = lazy(() => import("./scenes/centersV2"));
// @ts-ignore
const Content = lazy(() => import("./scenes/content"));
// @ts-ignore
const DevelopAssetsPresentationPage = lazy(() => import("./scenes/develop/AssetsPresentationPage"));
// @ts-ignore
const DesignSystemPage = lazy(() => import("./scenes/develop/DesignSystemPage"));
// @ts-ignore
const DSNJExport = lazy(() => import("./scenes/dsnj-export"));
// @ts-ignore
const INJEPExport = lazy(() => import("./scenes/injep-export"));
// @ts-ignore
const EditTransport = lazy(() => import("./scenes/edit-transport"));
// @ts-ignore
const Goal = lazy(() => import("./scenes/goal"));
// @ts-ignore
const Inscription = lazy(() => import("./scenes/inscription"));
// @ts-ignore
const Missions = lazy(() => import("./scenes/missions"));
// @ts-ignore
const LigneBus = lazy(() => import("./scenes/plan-transport/ligne-bus"));
// @ts-ignore
const SchemaDeRepartition = lazy(() => import("./scenes/plan-transport/schema-repartition"));
// @ts-ignore
const TableDeRepartition = lazy(() => import("./scenes/plan-transport/table-repartition"));
// @ts-ignore
const PointDeRassemblement = lazy(() => import("./scenes/pointDeRassemblement"));
// @ts-ignore
const Profil = lazy(() => import("./scenes/profil"));
// @ts-ignore
const PublicSupport = lazy(() => import("./scenes/public-support-center"));
// @ts-ignore
const School = lazy(() => import("./scenes/school"));
// @ts-ignore
const SessionShareIndex = lazy(() => import("./scenes/session-phase1/index"));
// @ts-ignore
const Settings = lazy(() => import("./scenes/settings"));
// @ts-ignore
const RapportPdfPage = lazy(() => import("./scenes/settings/operations/rapport-pdf/RapportPdfPage"));
// @ts-ignore
const Structure = lazy(() => import("./scenes/structure"));
// @ts-ignore
const SupportCenter = lazy(() => import("./scenes/support-center"));
// @ts-ignore
const Utilisateur = lazy(() => import("./scenes/utilisateur"));
// @ts-ignore
const Validate = lazy(() => import("./scenes/validate"));
// @ts-ignore
const Volontaires = lazy(() => import("./scenes/volontaires"));
// @ts-ignore
const VolontairesHeadCenter = lazy(() => import("./scenes/volontaires-head-center"));
// @ts-ignore
const VolontairesResponsible = lazy(() => import("./scenes/volontaires-responsible"));
// @ts-ignore
const Etablissement = lazy(() => import("./scenes/etablissement"));
// @ts-ignore
const Classe = lazy(() => import("./scenes/classe"));
// @ts-ignore
const VolontaireCle = lazy(() => import("./scenes/volontaire-cle"));
// @ts-ignore
const Contact = lazy(() => import("./scenes/contact"));
// @ts-ignore
const Signup = lazy(() => import("./scenes/signup"));
// @ts-ignore
const ImportSiSnu = lazy(() => import("./scenes/importSiSnu"));
// @ts-ignore
const PlanMarketing = lazy(() => import("./scenes/planMarketing"));

//DashboardV2
// @ts-ignore
const DashboardHeadCenterV2 = lazy(() => import("./scenes/dashboardV2/head-center"));
// @ts-ignore
const DashboardV2 = lazy(() => import("./scenes/dashboardV2/moderator-ref"));
// @ts-ignore
const DashboardResponsibleV2 = lazy(() => import("./scenes/dashboardV2/responsible"));
// @ts-ignore
const DashboardVisitorV2 = lazy(() => import("./scenes/dashboardV2/visitor"));
// @ts-ignore
const Team = lazy(() => import("./scenes/team"));
// @ts-ignore
const Accueil = lazy(() => import("./scenes/dashboardV2/ref-cle/Accueil"));
// @ts-ignore
const ExportPage = lazy(() => import("./scenes/export"));
// @ts-ignore
const Enigmes = lazy(() => import("./scenes/enigmes"));

initApi();

class App extends React.Component {
  render() {
    return (
      <Sentry.ErrorBoundary fallback={ApplicationError}>
        <QueryClientProvider client={queryClient}>
          {/* @ts-ignore */}
          <Router history={history}>
            <ScrollToTop />
            <div className="main">
              <Suspense fallback={<Loader />}>
                <Switch>
                  {/* Aucune authentification nécessaire */}
                  <SentryRoute path="/email-preview/:id" component={EmailPreview} />
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
  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const { pathname, search } = useLocation();
  const [modal, setModal] = useState<{ isOpen: boolean; title?: string; message?: React.ReactNode; confirmText?: string; onConfirm?: (() => void) | null }>({
    isOpen: false,
    title: "",
    message: null,
    confirmText: "",
    onConfirm: null,
  });
  const [loading, setLoading] = useState(true);

  // pour les chefs de centre, il faut afficher une seul session à la fois si il y en a plusieurs (peu importe le centre de cohésion)
  const [sessionPhase1List, setSessionPhase1List] = useState(null);

  const renderDashboardV2 = () => {
    if (isReferentOrAdmin(user)) return <DashboardV2 />;
    if (isResponsibleOrSupervisor(user)) return <DashboardResponsibleV2 />;
    if (isResponsableDeCentre(user)) return <DashboardHeadCenterV2 />;
    if (isVisiteur(user)) return <DashboardVisitorV2 />;
    return null;
  };

  const renderVolontaire = () => {
    if (isResponsibleOrSupervisor(user)) return <VolontairesResponsible />;
    if (isResponsableDeCentre(user)) return <VolontairesHeadCenter />;
    if (isReferentOrAdmin(user) || isAdminCle(user) || isReferentClasse(user)) return <Volontaires />;
    return null;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.checkToken();
        if (!res.ok || !res.user) {
          setJwtToken(null);
          dispatch(setUser(null));
          setLoading(false);
        }
        if (res.token) setJwtToken(res.token);
        if (res.user) dispatch(setUser(res.user));
        const cohorts = await getCohorts(); // TODO: mise en place d'un cache (redux-persist?)
        if (cohorts) dispatch({ type: COHORTS_ACTIONS.SET_COHORTS, payload: cohorts });

        //Load session phase 1 for head center before stop loading
        if (!isResponsableDeCentre(res.user)) setLoading(false);
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

    if (isResponsableDeCentre(user)) {
      (async () => {
        try {
          const { ok, data, code } = await api.get(`/referent/${user._id}/session-phase1?with_cohesion_center=true`);
          if (!ok) return console.log(`Error: ${code}`);

          const sessions = data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

  const handleImpersonationMessage = (event) => {
    if (event.data.action === "impersonation_started" || event.data.action === "impersonation_stopped") {
      window.location.reload();
    }
  };

  const channel = getImpersonationChannel();
  channel.addEventListener("message", handleImpersonationMessage);

  if (loading) return <Loader />;
  if (!user) {
    const queryObject: any = { disconnected: 1 };
    if (pathname) queryObject.redirect = `${pathname}${search}`;

    return <Redirect to={`/auth?${queryString.stringify(queryObject)}`} />;
  }

  return (
    <div>
      <RestorePreviousSigninFlag />

      <div className="flex">
        <SideBar sessionsList={sessionPhase1List} />
        <div className="flex flex-col w-full">
          <div className={`flex-1  min-h-screen`}>
            <Sentry.ErrorBoundary fallback={ApplicationError}>
              <Suspense fallback={<Loader />}>
                <Switch>
                  <SentryRoute path="/enigme/:id" render={(props) => <Enigmes {...props} />} />
                  <SentryRoute path="/enigmes/:id" render={(props) => <Enigmes {...props} />} />
                  <RestrictedRoute path="/structure" component={Structure} />
                  <RestrictedRoute path="/settings/operations/simulation/rapport-pdf/:id" component={RapportPdfPage} />
                  <RestrictedRoute path="/settings/:tab?" component={Settings} />
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
                  <RestrictedRoute path="/injep-export" component={INJEPExport} />
                  <RestrictedRoute path="/import-si-snu" component={ImportSiSnu} />
                  {[ROLES.ADMIN].includes(user?.role) && SUB_ROLE_GOD === user?.subRole ? <RestrictedRoute path="/plan-marketing/:tab?" component={PlanMarketing} /> : null}

                  {/* Plan de transport */}
                  {isWriteAuthorized({ user, resource: PERMISSION_RESOURCES.LIGNE_BUS }) ? <RestrictedRoute path="/edit-transport" component={EditTransport} /> : null}
                  {/* Table de répartition */}
                  <RestrictedRoute path="/table-repartition" component={TableDeRepartition} />
                  {/* Ligne de bus */}
                  <RestrictedRoute path="/ligne-de-bus" component={LigneBus} />
                  {/* Schéma de répartition */}
                  <RestrictedRoute path="/schema-repartition/:region/:department" component={SchemaDeRepartition} />
                  <RestrictedRoute path="/schema-repartition/:region" component={SchemaDeRepartition} />
                  <RestrictedRoute path="/schema-repartition" component={SchemaDeRepartition} />
                  {/* Institution */}
                  <RestrictedRoute path="/accueil" component={Accueil} />
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
                  <RestrictedRoute path="/export/:id" component={ExportPage} />
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
          modal?.onConfirm?.();
          setModal({ isOpen: false, onConfirm: null });
        }}
        onCancel={() => {
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </div>
  );
};
