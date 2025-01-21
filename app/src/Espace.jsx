import React, { lazy, Suspense, useEffect, useState } from "react";
import useAuth from "./services/useAuth";
import useCohort from "./services/useCohort";
import API from "./services/api";
import { ENABLE_PM, FEATURES_NAME, YOUNG_STATUS, isFeatureEnabled, permissionPhase2, shouldReAcceptRI } from "./utils";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "./sentry";
import { environment } from "./config";
import { toastr } from "react-redux-toastr";
import { shouldForceRedirectToInscription } from "./utils/navigation";

import ClassicLayout from "./components/layout";
import PageLoader from "./components/PageLoader";
import Diagoriente from "./components/layout/navbar/components/Diagoriente";
import ModalCGU from "./components/modals/ModalCGU";
import ModalRI from "./components/modals/ModalRI";

const Account = lazy(() => import("./scenes/account"));
const AutresEngagements = lazy(() => import("./scenes/phase3/home/waitingRealisation"));
const ChangeSejour = lazy(() => import("./scenes/changeSejour"));
const Candidature = lazy(() => import("./scenes/candidature"));
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

  const { young } = useAuth();
  const { cohort } = useCohort();

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

  const isInscriptionModificationOpenForYoungs = new Date() < new Date(cohort.inscriptionModificationEndDate);

  if (shouldForceRedirectToInscription(young, isInscriptionModificationOpenForYoungs)) return <Redirect to="/inscription" />;

  return (
    <ClassicLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <SentryRoute exact path="/" component={Home} />
          <SentryRoute path="/account" component={Account} />
          <SentryRoute path="/echanges" component={Echanges} />
          <SentryRoute path="/phase1" component={Phase1} />
          {permissionPhase2(young) && <SentryRoute path="/phase2" component={Phase2} />}
          <SentryRoute path="/phase3" component={Phase3} />
          <SentryRoute path="/autres-engagements" component={AutresEngagements} />
          <SentryRoute path="/les-programmes" component={Engagement} />
          <SentryRoute path="/mission" component={Missions} />
          <SentryRoute path="/candidature" component={Candidature} />
          {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <SentryRoute path="/design-system" component={DesignSystemPage} />}
          <SentryRoute path="/diagoriente" component={Diagoriente} />
          <SentryRoute path="/changer-de-sejour" component={ChangeSejour} />
          {ENABLE_PM && <SentryRoute path="/ma-preparation-militaire" component={MilitaryPreparation} />}
          <Redirect to="/" />
        </Switch>
      </Suspense>
      {isModalCGUOpen ? <ModalCGU isOpen={isModalCGUOpen} onAccept={handleModalCGUConfirm} /> : null}
      {isModalRIOpen ? <ModalRI isOpen={isModalRIOpen} onAccept={handleModalRIConfirm} /> : null}
    </ClassicLayout>
  );
};

export default Espace;
