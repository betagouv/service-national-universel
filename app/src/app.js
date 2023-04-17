import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Router, Switch, useLocation } from "react-router-dom";

import queryString from "query-string";

import { setYoung } from "./redux/auth/actions";

import Footer from "./components/footer";
import Loader from "./components/Loader";
import Account from "./scenes/account";
import AllEngagements from "./scenes/all-engagements/index";
import AuthV2 from "./scenes/authV2";
import Bug from "./scenes/bug";
import Candidature from "./scenes/candidature";
import CGU from "./scenes/CGU";
import Contract from "./scenes/contract";
import ContractDone from "./scenes/contract/done";
import Diagoriente from "./scenes/diagoriente";
import Engagement from "./scenes/engagement";
import Home from "./scenes/home";
import Inscription2023 from "./scenes/inscription2023";
import Maintenance from "./scenes/maintenance";
import MilitaryPreparation from "./scenes/militaryPreparation";
import Missions from "./scenes/missions";
import ModalResumePhase1ForWithdrawn from "./components/modals/ModalResumePhase1ForWithdrawn";
import Navbar from "./components/layout/navbar";
import Phase1 from "./scenes/phase1";
import changeSejour from "./scenes/phase1/changeSejour";
import Phase2 from "./scenes/phase2";
import Phase3 from "./scenes/phase3";
import Preferences from "./scenes/preferences";
import PreInscription from "./scenes/preinscription";
import NonEligible from "./scenes/noneligible";
import PublicSupport from "./scenes/public-support-center";
import ReInscription from "./scenes/reinscription";
import RepresentantsLegaux from "./scenes/representants-legaux";
import SupportCenter from "./scenes/support-center";
import DevelopAssetsPresentationPage from "./scenes/develop/AssetsPresentationPage";

import ModalCGU from "./components/modals/ModalCGU";
import { environment, maintenance } from "./config";
import api, { initApi } from "./services/api";

import { toastr } from "react-redux-toastr";
import "./index.css";
import { canYoungResumePhase1, ENABLE_PM, YOUNG_STATUS } from "./utils";

import { inscriptionModificationOpenForYoungs, youngCanChangeSession } from "snu-lib";
import { history, initSentry, SentryRoute } from "./sentry";
import * as Sentry from "@sentry/react";
import { cohortsInit } from "./utils/cohorts";
import { getAvailableSessions } from "./services/cohort.service";
import Modal from "./components/ui/modals/Modal";
import ButtonLight from "./components/ui/buttons/ButtonLight";
import Warning from "./assets/icons/Warning";

initSentry();
initApi();

function FallbackComponent() {
  return <></>;
}

const myFallback = <FallbackComponent />;

export default function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    const params = queryString.parse(location.search);
    const { utm_source, utm_medium, utm_campaign } = params;
    const sessionProperties = {};
    if (utm_source) sessionProperties.utm_source = utm_source;
    if (utm_medium) sessionProperties.utm_medium = utm_medium;
    if (utm_campaign) sessionProperties.utm_campaign = utm_campaign;
    async function fetchData() {
      try {
        const { ok, user, token } = await api.get("/young/signin_token");
        if (!ok) {
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
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <Sentry.ErrorBoundary fallback={myFallback}>
      <Router history={history}>
        <ScrollToTop />
        {/* <GoogleTags /> */}
        <div className={`${environment === "production" ? "main" : "flex h-screen flex-col justify-between"}`}>
          {maintenance && !localStorage?.getItem("override_maintenance") ? (
            <Switch>
              <SentryRoute path="/" component={Maintenance} />
            </Switch>
          ) : (
            <Switch>
              <SentryRoute path="/bug" component={Bug} />
              <SentryRoute path="/conditions-generales-utilisation" component={CGU} />
              <SentryRoute path="/public-besoin-d-aide" component={PublicSupport} />
              <SentryRoute path="/besoin-d-aide" component={SupportCenter} />
              <SentryRoute path="/validate-contract/done" component={ContractDone} />
              <SentryRoute path="/validate-contract" component={Contract} />
              <SentryRoute path="/inscription2023" component={Inscription2023} />
              {/* @todo: clean this */}
              <SentryRoute path="/noneligible" component={NonEligible} />
              <SentryRoute path="/reinscription" component={ReInscription} />
              <SentryRoute path="/preinscription" component={PreInscription} />
              <SentryRoute path="/auth" component={AuthV2} />
              <SentryRoute path="/representants-legaux" component={RepresentantsLegaux} /> :
              <SentryRoute path="/public-engagements" component={AllEngagements} />
              <SentryRoute path="/" component={Espace} />
            </Switch>
          )}
        </div>
      </Router>
    </Sentry.ErrorBoundary>
  );
}

const Espace = () => {
  const [isModalCGUOpen, setIsModalCGUOpen] = useState(false);
  const [isResumePhase1WithdrawnModalOpen, setIsResumePhase1WithdrawnModalOpen] = useState(false);

  // ! To clean after depart April B
  const [warningBusDepartLundiGoodModalOpen, setWarningBusDepartLundiGoodModalOpen] = useState(false);
  // ! To clean after depart April B

  const young = useSelector((state) => state.Auth.young);

  // ! To clean after depart April B

  const busDepartLundiGood = [
    "6422a6bc2e94300602510605",
    "6422a6bd2e94300602510652",
    "6422a6bd2e943006025106a8",
    "6422a6bd2e94300602510708",
    "6422a6c12e94300602510a56",
    "6422a6c22e94300602510b03",
    "6422a6c32e94300602510c13",
    "6422a6c42e94300602510ca5",
    "6422a6c42e94300602510cf9",
    "6422a6c62e94300602510e72",
    "6422a6c82e9430060251101b",
    "6422a6c92e94300602511196",
    "6422a6c92e943006025111b2",
    "6422a6c92e94300602511206",
    "6422a6ca2e94300602511298",
    "6422a6ca2e94300602511312",
    "6422a6d02e943006025117d6",
    "6422a6de2e94300602512250",
    "6422a6de2e9430060251228e",
    "6422a6df2e94300602512309",
    "6422a6df2e94300602512372",
  ];

  // ! To clean after depart April B

  const handleModalCGUConfirm = async () => {
    setIsModalCGUOpen(false);
    const { ok, code } = await api.put(`/young`, { acceptCGU: "true" });
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

    // ! To clean after depart April B
    if (young && busDepartLundiGood.includes(young.ligneId)) {
      setWarningBusDepartLundiGoodModalOpen(true);
    }
    // ! To clean after depart April B

    if (location.pathname === "/" && young && young.acceptCGU === "true" && canYoungResumePhase1(young)) {
      getAvailableSessions(young).then((sessions) => {
        if (sessions.length) setIsResumePhase1WithdrawnModalOpen(true);
      });
    }
    return () => {
      setIsModalCGUOpen(false);
      setIsResumePhase1WithdrawnModalOpen(false);
    };
  }, [young]);

  if (!young) {
    const redirect = encodeURIComponent(window.location.href.replace(window.location.origin, "").substring(1));
    if (redirect === "inscription") return <Redirect to="/preinscription" />;
    else return <Redirect to={{ search: redirect && redirect !== "logout" ? `?redirect=${redirect}` : "", pathname: "/auth" }} />;
  }

  if (young.status === YOUNG_STATUS.NOT_ELIGIBLE) return <Redirect to="/noneligible" />;

  const forceRedirectReinscription = young.reinscriptionStep2023 && young.reinscriptionStep2023 !== "DONE";
  if (forceRedirectReinscription) return <Redirect to="/reinscription" />;

  const forceRedirectInscription =
    [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED].includes(young.status) ||
    (inscriptionModificationOpenForYoungs(young.cohort) && young.status === YOUNG_STATUS.WAITING_VALIDATION && young.inscriptionStep2023 !== "DONE");
  if (forceRedirectInscription) return <Redirect to="/inscription2023" />;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 w-screen  md:right-auto md:w-64">
        <Navbar />
      </div>
      <main className="mt-16 md:mt-0 md:ml-[16rem]">
        <Switch>
          <SentryRoute path="/account" component={Account} />
          <SentryRoute path="/phase1" component={Phase1} />
          <SentryRoute path="/phase2" component={Phase2} />
          <SentryRoute path="/phase3" component={Phase3} />
          <SentryRoute path="/les-programmes" component={Engagement} />
          <SentryRoute path="/preferences" component={Preferences} />
          <SentryRoute path="/mission" component={Missions} />
          <SentryRoute path="/candidature" component={Candidature} />
          {environment === "development" && <SentryRoute path="/develop-assets" component={DevelopAssetsPresentationPage} />}
          <SentryRoute path="/diagoriente" component={Diagoriente} />
          {youngCanChangeSession(young) ? <SentryRoute path="/changer-de-sejour" component={changeSejour} /> : null}
          {ENABLE_PM && <SentryRoute path="/ma-preparation-militaire" component={MilitaryPreparation} />}
          <SentryRoute path="/" component={Home} />
        </Switch>
      </main>
      <Footer />
      <ModalCGU isOpen={isModalCGUOpen} onAccept={handleModalCGUConfirm} />
      <ModalResumePhase1ForWithdrawn isOpen={isResumePhase1WithdrawnModalOpen} onClose={() => setIsResumePhase1WithdrawnModalOpen(false)} />
      <ModalBusDepartLundiGood isOpen={warningBusDepartLundiGoodModalOpen} onClose={() => setWarningBusDepartLundiGoodModalOpen(false)} />
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

// ! To clean after depart April B

const ModalBusDepartLundiGood = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[512px] rounded-xl bg-white p-6">
      <div className="flex flex-col gap-2">
        <Warning className="mx-auto h-10 w-10 text-gray-400" />
        <h4 className="mx-auto flex text-center">Départ en séjour - Lundi 17 avril - Confirmé</h4>
      </div>
      <p className="mx-2 mt-4 text-sm leading-5 text-gray-500">
        Bonjour, <br />
        <br />
        Votre départ est confirmé pour lundi 17 avril 2023 : les éléments complémentaires (lieu de rassemblement et horaire) sont à retrouver sur votre convocation : onglet Phase
        1. <br />
        <br />
        Nous vous prions de bien vouloir nous excuser pour la gêne occasionnée, et vous remercions pour votre engagement.
        <br />
        <br />
        Cordialement, <br />
        Les équipes du Service National Universel
      </p>
      <div className="mt-12">
        <ButtonLight className="w-full" onClick={onClose}>
          Fermer
        </ButtonLight>
      </div>
    </Modal>
  );
};
