import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Router, Switch, useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";

import { setYoung } from "./redux/auth/actions";
import { toastr } from "react-redux-toastr";
import * as Sentry from "@sentry/react";

import Account from "./scenes/account";
import AllEngagements from "./scenes/all-engagements/index";
import Auth from "./scenes/auth";
import Candidature from "./scenes/candidature";
import CGU from "./scenes/CGU";
import ChangeSejour from "./scenes/phase1/changeSejour";
import Contact from "./scenes/contact";
import Contract from "./scenes/contract";
import ContractDone from "./scenes/contract/done";
import DevelopAssetsPresentationPage from "./scenes/develop/AssetsPresentationPage";
import DesignSystemPage from "./scenes/develop/DesignSystemPage";
import Diagoriente from "./scenes/diagoriente";
import Engagement from "./scenes/engagement";
import Footer from "./components/footer";
import Home from "./scenes/home";
import Inscription2023 from "./scenes/inscription2023";
import Loader from "./components/Loader";
import Maintenance from "./scenes/maintenance";
import MilitaryPreparation from "./scenes/militaryPreparation";
import Missions from "./scenes/missions";
import ModalCGU from "./components/modals/ModalCGU";
import Navbar from "./components/layout/navbar";
import NonEligible from "./scenes/noneligible";
import Phase1 from "./scenes/phase1";
import Phase2 from "./scenes/phase2";
import Phase3 from "./scenes/phase3";
import AutresEngagements from "./scenes/phase3/home/waitingRealisation";
import Echanges from "./scenes/echanges";
import Preferences from "./scenes/preferences";
import PreInscription from "./scenes/preinscription";
import ReInscription from "./scenes/reinscription";
import OnBoarding from "./scenes/cle/OnBoarding";
import AccountAlreadyExists from "./scenes/account/AccountAlreadyExists";
import RepresentantsLegaux from "./scenes/representants-legaux";
import Thanks from "./scenes/contact/Thanks";
import ViewMessage from "./scenes/echanges/View";

import { environment, maintenance } from "./config";
import api, { initApi } from "./services/api";
import { ENABLE_PM, YOUNG_STATUS } from "./utils";
import {
  youngCanChangeSession,
  inscriptionModificationOpenForYoungs,
  shouldForceRedirectToReinscription,
  shouldForceRedirectToInscription,
  isFeatureEnabled,
  FEATURES_NAME,
} from "snu-lib";
import { capture, history, initSentry, SentryRoute } from "./sentry";
import { cohortsInit, getCohort } from "./utils/cohorts";

initSentry();
initApi();

function FallbackComponent() {
  return <></>;
}

const myFallback = <FallbackComponent />;

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error) => capture(error) }),
});

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={myFallback}>
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <ScrollToTop />
          <div className="flex h-screen flex-col justify-between">
            {maintenance ? (
              <Switch>
                <SentryRoute path="/" component={Maintenance} />
              </Switch>
            ) : (
              <Switch>
                {/* Aucune authentification nécessaire */}
                <SentryRoute path="/noneligible" component={NonEligible} />
                <SentryRoute path="/conditions-generales-utilisation" component={CGU} />
                <SentryRoute path="/validate-contract/done" component={ContractDone} />
                <SentryRoute path="/validate-contract" component={Contract} />
                <SentryRoute path="/representants-legaux" component={RepresentantsLegaux} />
                <SentryRoute path="/je-rejoins-ma-classe-engagee" component={OnBoarding} />
                <SentryRoute path="/je-suis-deja-inscrit" component={AccountAlreadyExists} />
                {/* Authentification accessoire */}
                <SentryRoute path={["/public-besoin-d-aide", "/auth", "/public-engagements", "/besoin-d-aide", "/merci", "/preinscription"]} component={() => <OptionalLogIn />} />
                {/* Authentification nécessaire */}
                <SentryRoute path="/" component={() => <MandatoryLogIn />} />
              </Switch>
            )}
          </div>
        </Router>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

const OptionalLogIn = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.young);

  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
      try {
        const { ok, user, token } = await api.checkToken();
        if (!ok) {
          api.setToken(null);
          dispatch(setYoung(null));
          return setLoading(false);
        }
        if (token) api.setToken(token);
        if (ok && user) {
          dispatch(setYoung(user));
          await cohortsInit();
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (user && location.pathname.includes("/auth")) return <Redirect to="/" />;

  return (
    <Switch>
      <SentryRoute path="/public-besoin-d-aide" component={Contact} />
      <SentryRoute path="/besoin-d-aide/ticket/:id" component={ViewMessage} />
      <SentryRoute path="/besoin-d-aide" component={Contact} />
      <SentryRoute path="/auth" component={Auth} />
      <SentryRoute path="/public-engagements" component={AllEngagements} />
      <SentryRoute path="/merci" component={Thanks} />
      <SentryRoute path="/preinscription" component={PreInscription} />
      <Redirect to="/" />
    </Switch>
  );
};

const MandatoryLogIn = () => {
  const { pathname, search } = useLocation();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.young);
  const history = useHistory();

  useEffect(() => {
    async function fetchData() {
      try {
        const { ok, user, token } = await api.checkToken();
        if (!ok) {
          api.setToken(null);
          dispatch(setYoung(null));
        }
        await cohortsInit();
        if (token) api.setToken(token);
        if (ok && user) {
          dispatch(setYoung(user));
          const cohort = await getCohort(user.cohort);

          const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, environment);
          const forceEmailValidation =
            isEmailValidationEnabled && user.status === YOUNG_STATUS.IN_PROGRESS && user.emailVerified === "false" && inscriptionModificationOpenForYoungs(cohort);
          if (forceEmailValidation) return history.push("/preinscription");
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (!user) {
    const queryObject = { disconnected: 1 };
    if (pathname) queryObject.redirect = `${pathname}${search}`;

    return <Redirect to={`/auth?${queryString.stringify(queryObject)}`} />;
  }

  return (
    <Switch>
      <SentryRoute path="/inscription2023" component={Inscription2023} />
      <SentryRoute path="/reinscription" component={ReInscription} />
      <SentryRoute path="/" component={Espace} />
    </Switch>
  );
};

const Espace = () => {
  const [isModalCGUOpen, setIsModalCGUOpen] = useState(false);

  const young = useSelector((state) => state.Auth.young);
  const cohort = getCohort(young.cohort);

  const handleModalCGUConfirm = async () => {
    setIsModalCGUOpen(false);
    const { ok, code } = await api.put(`/young/accept-cgu`);
    if (!ok) {
      setIsModalCGUOpen(true);
      return toastr.error(`Une erreur est survenue : ${code}`);
    }
    return toastr.success("Vous avez bien accepté les conditions générales d'utilisation.");
  };

  useEffect(() => {
    if (young && young.acceptCGU !== "true") {
      setIsModalCGUOpen(true);
    }
  }, [young]);

  if (young.status === YOUNG_STATUS.NOT_ELIGIBLE && location.pathname !== "/noneligible") return <Redirect to="/noneligible" />;

  if (shouldForceRedirectToReinscription(young)) return <Redirect to="/reinscription" />;

  if (shouldForceRedirectToInscription(young, inscriptionModificationOpenForYoungs(cohort))) return <Redirect to="/inscription2023" />;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 w-screen  md:right-auto md:w-64">
        <Navbar />
      </div>
      <main className="mt-16 md:mt-0 md:ml-[16rem]">
        <Switch>
          <SentryRoute exact path="/" component={Home} />
          <SentryRoute path="/account" component={Account} />
          <SentryRoute path="/echanges" component={Echanges} />
          <SentryRoute path="/phase1" component={Phase1} />
          <SentryRoute path="/phase2" component={Phase2} />
          <SentryRoute path="/phase3" component={Phase3} />
          <SentryRoute path="/autres-engagements" component={AutresEngagements} />
          <SentryRoute path="/les-programmes" component={Engagement} />
          <SentryRoute path="/preferences" component={Preferences} />
          <SentryRoute path="/mission" component={Missions} />
          <SentryRoute path="/candidature" component={Candidature} />
          {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <SentryRoute path="/develop-assets" component={DevelopAssetsPresentationPage} />}
          {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <SentryRoute path="/design-system" component={DesignSystemPage} />}
          <SentryRoute path="/diagoriente" component={Diagoriente} />
          {youngCanChangeSession(young) ? <SentryRoute path="/changer-de-sejour" component={ChangeSejour} /> : null}
          {ENABLE_PM && <SentryRoute path="/ma-preparation-militaire" component={MilitaryPreparation} />}
          <Redirect to="/" />
        </Switch>
      </main>
      <Footer />

      <ModalCGU isOpen={isModalCGUOpen} onAccept={handleModalCGUConfirm} />
    </>
  );
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
