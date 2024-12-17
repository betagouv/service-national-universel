import React, { lazy, Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCohort } from "./utils/cohorts";
import API from "./services/api";
import { FEATURES_NAME, YOUNG_STATUS, YOUNG_STATUS_PHASE1, isFeatureEnabled, permissionPhase2, shouldReAcceptRI } from "./utils";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "./sentry";
import { environment } from "./config";
import { toastr } from "react-redux-toastr";
import useRedirects from "./hooks/useRedirects";

import ClassicLayout from "./components/layout";
import PageLoader from "./components/PageLoader";
import Diagoriente from "./components/layout/navbar/components/Diagoriente";
import ModalCGU from "./components/modals/ModalCGU";
import ModalRI from "./components/modals/ModalRI";
import useAuth from "./services/useAuth";

const Account = lazy(() => import("./scenes/account"));
const AutresEngagements = lazy(() => import("./scenes/phase3/home/waitingRealisation"));
const ChangeSejour = lazy(() => import("./scenes/changeSejour"));
const Candidature = lazy(() => import("./scenes/candidature"));
const DevelopAssetsPresentationPage = lazy(() => import("./scenes/develop/AssetsPresentationPage"));
const DesignSystemPage = lazy(() => import("./scenes/develop/DesignSystemPage"));
const Echanges = lazy(() => import("./scenes/echanges"));
const Engagement = lazy(() => import("./scenes/home/components/Engagement"));
const Home = lazy(() => import("./scenes/home"));
const MilitaryPreparation = lazy(() => import("./scenes/militaryPreparation"));
const Missions = lazy(() => import("./scenes/missions"));
const Phase1 = lazy(() => import("./scenes/phase1"));
const Phase2 = lazy(() => import("./scenes/phase2"));
const Phase3 = lazy(() => import("./scenes/phase3"));

const Espace = () => {
  const [isModalCGUOpen, setIsModalCGUOpen] = useState(false);
  const [isModalRIOpen, setIsModalRIOpen] = useState(false);

  const young = useSelector((state) => state.Auth.young);
  const cohort = getCohort(young.cohort);
  const { shouldForceRedirectToEmailValidation, shouldForceRedirectToReinscription, shouldForceRedirectToInscription } = useRedirects();

  const handleModalCGUConfirm = async () => {
    setIsModalCGUOpen(false);
    const { ok, code } = await API.put(`/young/accept-cgu`);
    if (!ok) {
      setIsModalCGUOpen(true);
      return toastr.error(`Une erreur est survenue : ${code}`);
    }
    return toastr.success("Vous avez bien accepté les conditions générales d'utilisation.");
  };

  const handleModalRIConfirm = async () => {
    setIsModalRIOpen(false);
    const { ok, code } = await API.put(`/young/accept-ri`);
    if (!ok) {
      setIsModalRIOpen(true);
      return toastr.error(`Une erreur est survenue : ${code}`);
    }
    return toastr.success("Vous avez bien accepté le nouveau règlement intérieur.");
  };

  useEffect(() => {
    if (young && young.acceptCGU !== "true") {
      setIsModalCGUOpen(true);
    } else if (shouldReAcceptRI(young, cohort)) {
      setIsModalRIOpen(true);
    }
  }, [young, cohort]);

  if (!young || !cohort) return <PageLoader />;

  if (young.status === YOUNG_STATUS.NOT_ELIGIBLE && location.pathname !== "/noneligible") return <Redirect to="/noneligible" />;

  if (shouldForceRedirectToEmailValidation) {
    return <Redirect to="/preinscription/email-validation" />;
  }
  if (shouldForceRedirectToReinscription) {
    return <Redirect to="/reinscription" />;
  }
  if (shouldForceRedirectToInscription) {
    return <Redirect to="/inscription" />;
  }

  return (
    <ClassicLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <SentryRoute exact path="/" component={Home} />
          <SentryRoute path="/account" component={Account} />
          <SentryRoute path="/echanges" component={Echanges} />
          <SentryRoute path="/phase1" component={Phase1} />
          <RouteWithStatusGate
            status={[YOUNG_STATUS.VALIDATED]}
            statusPhase1={[YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED]}
            path="/phase1"
            component={Phase1}
          />
          {permissionPhase2(young) && <SentryRoute path="/phase2" component={Phase2} />}
          <SentryRoute path="/phase3" component={Phase3} />
          <SentryRoute path="/autres-engagements" component={AutresEngagements} />
          <SentryRoute path="/les-programmes" component={Engagement} />
          <SentryRoute path="/mission" component={Missions} />
          <SentryRoute path="/candidature" component={Candidature} />
          {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <SentryRoute path="/develop-assets" component={DevelopAssetsPresentationPage} />}
          {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <SentryRoute path="/design-system" component={DesignSystemPage} />}
          <SentryRoute path="/diagoriente" component={Diagoriente} />
          <SentryRoute path="/changer-de-sejour" component={ChangeSejour} />
          <SentryRoute path="/ma-preparation-militaire" component={MilitaryPreparation} />
          <Redirect to="/" />
        </Switch>
      </Suspense>
      {isModalCGUOpen ? <ModalCGU isOpen={isModalCGUOpen} onAccept={handleModalCGUConfirm} /> : null}
      {isModalRIOpen ? <ModalRI isOpen={isModalRIOpen} onAccept={handleModalRIConfirm} /> : null}
    </ClassicLayout>
  );
};

type RouteWithStatusGateProps = {
  status?: string[];
  statusPhase1?: string[];
  statusPhase2?: string[];
  statusPhase3?: string[];
  enabled?: boolean;
  path: string;
  component: React.ComponentType;
};

function hasAccess(young, status, statusPhase1, statusPhase2, statusPhase3) {
  if (status?.length && !status.includes(young.status)) return false;
  if (statusPhase1?.length && !statusPhase1.includes(young.statusPhase1)) return false;
  if (statusPhase2?.length && !statusPhase2.includes(young.statusPhase2)) return false;
  if (statusPhase3?.length && !statusPhase3.includes(young.statusPhase3)) return false;
  return true;
}

function RouteWithAccessControl({ status, statusPhase1, statusPhase2, statusPhase3, enabled = true, path, component }: RouteWithStatusGateProps) {
  const { young } = useAuth();
  if (!enabled || !hasAccess(young, status, statusPhase1, statusPhase2, statusPhase3)) {
    console.log("Access denied", { status, statusPhase1, statusPhase2, statusPhase3 });
    return <Redirect to="/" />;
  }
  return <SentryRoute path={path} component={component} />;
}

export default Espace;
