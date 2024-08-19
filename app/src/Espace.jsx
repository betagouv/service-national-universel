import React, { lazy, Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCohort } from "./utils/cohorts";
import API from "./services/api";
import {
  ENABLE_PM,
  FEATURES_NAME,
  YOUNG_STATUS,
  isFeatureEnabled,
  shouldDisplayMaintenanceNotice,
  shouldForceRedirectToInscription,
  shouldForceRedirectToReinscription,
  shouldReAcceptRI,
  youngCanChangeSession,
} from "./utils";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "./sentry";
import { environment } from "./config";
import { toastr } from "react-redux-toastr";

import Navbar from "./components/layout/navbar";
import Notice from "./components/ui/alerts/Notice";
import Loader from "./components/Loader";
import Diagoriente from "./components/layout/navbar/components/Diagoriente";
import Footer from "./components/footer";
import ModalCGU from "./components/modals/ModalCGU";
import ModalRI from "./components/modals/ModalRI";

const Account = lazy(() => import("./scenes/account"));
const AutresEngagements = lazy(() => import("./scenes/phase3/home/waitingRealisation"));
const ChangeSejour = lazy(() => import("./scenes/phase1/changeSejour"));
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

  if (young.status === YOUNG_STATUS.NOT_ELIGIBLE && location.pathname !== "/noneligible") return <Redirect to="/noneligible" />;

  if (shouldForceRedirectToReinscription(young)) return <Redirect to="/reinscription" />;

  const isInscriptionModificationOpenForYoungs = new Date() < new Date(cohort.inscriptionModificationEndDate);

  if (shouldForceRedirectToInscription(young, isInscriptionModificationOpenForYoungs)) return <Redirect to="/inscription2023" />;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 w-screen  md:right-auto md:w-64">
        <Navbar />
      </div>
      <main className="mt-16 md:mt-0 md:ml-[16rem]">
        {shouldDisplayMaintenanceNotice && (
          <Notice>Maintenance planifiée jeudi 18 avril de 20h à minuit&nbsp;: vous ne serez pas en mesure d'accéder aux plateformes pendant cette période.</Notice>
        )}
        <Suspense fallback={<Loader />}>
          <Switch>
            <SentryRoute exact path="/" component={Home} />
            <SentryRoute path="/account" component={Account} />
            <SentryRoute path="/echanges" component={Echanges} />
            <SentryRoute path="/phase1" component={Phase1} />
            <SentryRoute path="/phase2" component={Phase2} />
            <SentryRoute path="/phase3" component={Phase3} />
            <SentryRoute path="/autres-engagements" component={AutresEngagements} />
            <SentryRoute path="/les-programmes" component={Engagement} />
            <SentryRoute path="/mission" component={Missions} />
            <SentryRoute path="/candidature" component={Candidature} />
            {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <SentryRoute path="/develop-assets" component={DevelopAssetsPresentationPage} />}
            {isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, undefined, environment) && <SentryRoute path="/design-system" component={DesignSystemPage} />}
            <SentryRoute path="/diagoriente" component={Diagoriente} />
            {youngCanChangeSession(young) ? <SentryRoute path="/changer-de-sejour" component={ChangeSejour} /> : null}
            {ENABLE_PM && <SentryRoute path="/ma-preparation-militaire" component={MilitaryPreparation} />}
            <Redirect to="/" />
          </Switch>
        </Suspense>
      </main>
      <Footer />

      <ModalCGU isOpen={isModalCGUOpen} onAccept={handleModalCGUConfirm} />
      <ModalRI isOpen={isModalRIOpen} onAccept={handleModalRIConfirm} />
    </>
  );
};

export default Espace;
