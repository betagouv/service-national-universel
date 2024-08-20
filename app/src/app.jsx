// Require this first!
import { history, initSentry, SentryRoute } from "./sentry";
import * as Sentry from "@sentry/react";
initSentry();

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Link, Router, Switch, useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import { QueryClientProvider } from "@tanstack/react-query";

import { setYoung } from "./redux/auth/actions";

import useDocumentCss from "@/hooks/useDocumentCss";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";

import { environment, maintenance } from "./config";
import api, { initApi } from "./services/api";
import { queryClient } from "./services/react-query";
import { YOUNG_STATUS } from "./utils";
import { inscriptionModificationOpenForYoungs, isFeatureEnabled, FEATURES_NAME } from "snu-lib";
import { cohortsInit, getCohort } from "./utils/cohorts";
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
const Loader = lazy(() => import("./components/Loader"));
const Maintenance = lazy(() => import("./scenes/maintenance"));
const NonEligible = lazy(() => import("./scenes/noneligible"));
const OnBoarding = lazy(() => import("./scenes/cle/OnBoarding"));
const PreInscription = lazy(() => import("./scenes/preinscription"));
const ReInscription = lazy(() => import("./scenes/reinscription"));
const RepresentantsLegaux = lazy(() => import("./scenes/representants-legaux"));
const Thanks = lazy(() => import("./scenes/contact/Thanks"));
const ViewMessage = lazy(() => import("./scenes/echanges/View"));

initApi();

class App extends React.Component {
  render() {
    return (
      <Sentry.ErrorBoundary fallback={FallbackComponent}>
        <QueryClientProvider client={queryClient}>
          <Router history={history}>
            <ScrollToTop />
            <div className="flex min-h-screen flex-col justify-between">
              {maintenance ? (
                <Switch>
                  <SentryRoute path="/" component={Maintenance} />
                </Switch>
              ) : (
                <Switch>
                  <SentryRoute
                    path={[
                      "/validate-contract/done",
                      "/validate-contract",
                      "/conditions-generales-utilisation",
                      "/noneligible",
                      "/representants-legaux",
                      "/je-rejoins-ma-classe-engagee",
                      "/je-suis-deja-inscrit",
                      "/public-besoin-d-aide",
                      "/auth",
                      "/public-engagements",
                      "/besoin-d-aide",
                      "/merci",
                      "/preinscription",
                    ]}
                    component={() => <OptionalLogIn />}
                  />
                  <SentryRoute path="/" component={() => <MandatoryLogIn />} />
                </Switch>
              )}
            </div>
          </Router>
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    );
  }
}

export default Sentry.withProfiler(App);

const OptionalLogIn = () => {
  useDocumentCss(["/dsfr/utility/icons/icons.min.css", "/dsfr/dsfr.min.css"]);
  startReactDsfr({ defaultColorScheme: "light", Link });
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
  }, []); //eslint-disable-line

  if (loading) return <Loader />;
  if (user && location.pathname.includes("/auth")) return <Redirect to="/" />;

  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <SentryRoute path="/validate-contract/done" component={ContractDone} />
        <SentryRoute path="/validate-contract" component={Contract} />
        <SentryRoute path="/conditions-generales-utilisation" component={CGU} />
        <SentryRoute path="/noneligible" component={NonEligible} />
        <SentryRoute path="/representants-legaux" component={RepresentantsLegaux} />
        <SentryRoute path="/je-rejoins-ma-classe-engagee" component={OnBoarding} />
        <SentryRoute path="/je-suis-deja-inscrit" component={AccountAlreadyExists} />
        <SentryRoute path="/public-besoin-d-aide" component={Contact} />
        <SentryRoute path="/besoin-d-aide/ticket/:id" component={ViewMessage} />
        <SentryRoute path="/besoin-d-aide" component={Contact} />
        <SentryRoute path="/auth" component={Auth} />
        <SentryRoute path="/public-engagements" component={AllEngagements} />
        <SentryRoute path="/merci" component={Thanks} />
        <SentryRoute path="/preinscription" component={PreInscription} />
        <Redirect to="/" />
      </Switch>
    </Suspense>
  );
};

const Inscription = () => {
  useDocumentCss(["/dsfr/utility/icons/icons.min.css", "/dsfr/dsfr.min.css"]);
  startReactDsfr({ defaultColorScheme: "light", Link });

  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <SentryRoute path="/inscription2023" component={Inscription2023} />
        <SentryRoute path="/reinscription" component={ReInscription} />
        <Redirect to="/" />
      </Switch>
    </Suspense>
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
  if (!user) {
    const queryObject = { disconnected: 1 };
    if (pathname) queryObject.redirect = `${pathname}${search}`;

    return <Redirect to={`/auth?${queryString.stringify(queryObject)}`} />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <SentryRoute path={["/inscription2023", "/reinscription"]} component={Inscription} />
        <SentryRoute path="/" component={Espace} />
      </Switch>
    </Suspense>
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
