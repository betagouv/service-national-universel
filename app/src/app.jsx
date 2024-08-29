// Require this first!
import { history, initSentry, SentryRoute } from "./sentry";
import * as Sentry from "@sentry/react";
initSentry();

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Link, Router, Switch, useLocation, useHistory } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { setYoung } from "./redux/auth/actions";

import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";

import { environment, maintenance } from "./config";
import api, { initApi } from "./services/api";
import { queryClient } from "./services/react-query";
import { YOUNG_STATUS } from "./utils";
import { isFeatureEnabled, FEATURES_NAME } from "snu-lib";
import { cohortsInit, getCohort } from "./utils/cohorts";

import Loader from "./components/Loader";
import FallbackComponent from "./components/FallBackComponent";

const AccountAlreadyExists = lazy(() => import("./scenes/account/AccountAlreadyExists"));
const AllEngagements = lazy(() => import("./scenes/all-engagements/index"));
const Auth = lazy(() => import("./scenes/auth"));
const CGU = lazy(() => import("./scenes/CGU"));
const Contact = lazy(() => import("./scenes/contact"));
const Contract = lazy(() => import("./scenes/contract"));
const ContractDone = lazy(() => import("./scenes/contract/done"));
const Espace = lazy(() => import("./Espace"));
const Inscription2023 = lazy(() => import("./scenes/inscription2023"));
const Maintenance = lazy(() => import("./scenes/maintenance"));
const NonEligible = lazy(() => import("./scenes/noneligible"));
const OnBoarding = lazy(() => import("./scenes/cle/OnBoarding"));
const PreInscription = lazy(() => import("./scenes/preinscription"));
const ReInscription = lazy(() => import("./scenes/reinscription"));
const RepresentantsLegaux = lazy(() => import("./scenes/representants-legaux"));
const Thanks = lazy(() => import("./scenes/contact/Thanks"));
const ViewMessage = lazy(() => import("./scenes/echanges/View"));

initApi();
startReactDsfr({ defaultColorScheme: "light", Link });

function App() {
  return (
    <Sentry.ErrorBoundary fallback={FallbackComponent}>
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AutoScroll />
          {maintenance ? (
            <Switch>
              <SentryRoute path="/" component={Maintenance} />
            </Switch>
          ) : (
            <Suspense fallback={<Loader />}>
              <Switch>
                <RouteWithOptionalLogin path="/validate-contract/done" component={ContractDone} />
                <RouteWithOptionalLogin path="/validate-contract" component={Contract} />
                <RouteWithOptionalLogin path="/conditions-generales-utilisation" component={CGU} />
                <RouteWithOptionalLogin path="/noneligible" component={NonEligible} />
                <RouteWithOptionalLogin path="/representants-legaux" component={RepresentantsLegaux} />
                <RouteWithOptionalLogin path="/je-rejoins-ma-classe-engagee" component={OnBoarding} />
                <RouteWithOptionalLogin path="/je-suis-deja-inscrit" component={AccountAlreadyExists} />
                <RouteWithOptionalLogin path="/public-besoin-d-aide" component={Contact} />
                <RouteWithOptionalLogin path="/besoin-d-aide/ticket/:id" component={ViewMessage} />
                <RouteWithOptionalLogin path="/besoin-d-aide" component={Contact} />
                <RouteWithOptionalLogin path="/auth" component={Auth} />
                <RouteWithOptionalLogin path="/public-engagements" component={AllEngagements} />
                <RouteWithOptionalLogin path="/merci" component={Thanks} />
                <RouteWithOptionalLogin path="/preinscription" component={PreInscription} />
                <RouteWithMandatoryLogin path="/inscription2023" component={Inscription2023} />
                <RouteWithMandatoryLogin path="/reinscription" component={ReInscription} />
                <RouteWithMandatoryLogin path="/" component={Espace} />
              </Switch>
            </Suspense>
          )}
        </Router>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default Sentry.withProfiler(App);

function RouteWithOptionalLogin({ path, component }) {
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

  return <SentryRoute path={path} component={component} />;
}

function RouteWithMandatoryLogin({ path, component }) {
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
            isEmailValidationEnabled && user.status === YOUNG_STATUS.IN_PROGRESS && user.emailVerified === "false" && new Date() < new Date(cohort.inscriptionModificationEndDate);
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

  if (!user) return <Redirect to={`/auth?disconnected=1&redirect=${pathname}${search}`} />;

  return <SentryRoute path={path} component={component} />;
}

function AutoScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
