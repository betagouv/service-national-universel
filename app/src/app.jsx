// Require this first!
import { history, initSentry, SentryRoute } from "./sentry";
import * as Sentry from "@sentry/react";
initSentry();

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Link, Router, Switch, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { setYoung } from "./redux/auth/actions";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { maintenance } from "./config";
import api, { initApi } from "./services/api";
import { queryClient } from "./services/react-query";
import { shouldForceRedirectToEmailValidation } from "./utils/navigation";
import { cohortsInit } from "./utils/cohorts";

import PageLoader from "./components/PageLoader";
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
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  async function fetchData() {
    try {
      const { ok, user, token } = await api.checkToken();

      if (!ok || !user || !token) {
        api.setToken(null);
        dispatch(setYoung(null));
        return;
      }

      api.setToken(token);
      dispatch(setYoung(user));
      await cohortsInit();

      if (shouldForceRedirectToEmailValidation(user)) {
        history.push("/preinscription/email-validation");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  if (maintenance) return <Maintenance />;

  return (
    <Sentry.ErrorBoundary fallback={FallbackComponent}>
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AutoScroll />
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Redirect from={"/public-besoin-d-aide"} to={"/besoin-d-aide"} />
              <Redirect from={"/inscription2023"} to={"/inscription"} />

              <SentryRoute path="/validate-contract/done" component={ContractDone} />
              <SentryRoute path="/validate-contract" component={Contract} />
              <SentryRoute path="/conditions-generales-utilisation" component={CGU} />
              <SentryRoute path="/noneligible" component={NonEligible} />
              <SentryRoute path="/representants-legaux" component={RepresentantsLegaux} />
              <SentryRoute path="/je-rejoins-ma-classe-engagee" component={OnBoarding} />
              <SentryRoute path="/je-suis-deja-inscrit" component={AccountAlreadyExists} />
              <SentryRoute path="/besoin-d-aide/ticket/:id" component={ViewMessage} />
              <SentryRoute path="/besoin-d-aide" component={Contact} />
              {!young && <SentryRoute path="/auth" component={Auth} />}
              <SentryRoute path="/public-engagements" component={AllEngagements} />
              <SentryRoute path="/merci" component={Thanks} />
              <SentryRoute path="/preinscription" component={PreInscription} />

              <SecureRoute path="/inscription" component={Inscription2023} />
              <SecureRoute path="/reinscription" component={ReInscription} />
              <SecureRoute path="/" component={Espace} />
            </Switch>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default Sentry.withProfiler(App);

function SecureRoute({ path, component }) {
  const { pathname, search } = useLocation();
  const user = useSelector((state) => state.Auth.young);

  if (!user) {
    history.push(`/auth?disconnected=1&redirect=${pathname}${search}`);
    return;
  }
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
