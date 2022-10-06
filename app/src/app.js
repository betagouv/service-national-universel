import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Router, Switch, Redirect, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import queryString from "query-string";
import styled from "styled-components";

import { setYoung } from "./redux/auth/actions";

import Account from "./scenes/account";
import Auth from "./scenes/auth";
import AuthV2 from "./scenes/authV2";
import Home from "./scenes/home";
import Inscription from "./scenes/inscription";
import Inscription2023 from "./scenes/inscription2023";
import PreInscription from "./scenes/preinscription";
import Phase1 from "./scenes/phase1";
import Phase2 from "./scenes/phase2";
import Phase3 from "./scenes/phase3";
import Diagoriente from "./scenes/diagoriente";
import SupportCenter from "./scenes/support-center";
import Preferences from "./scenes/preferences";
import Missions from "./scenes/missions";
import Candidature from "./scenes/candidature";
import Contract from "./scenes/contract";
import ContractDone from "./scenes/contract/done";
import Loader from "./components/Loader";
import Header from "./components/header/index";
import Drawer from "./components/drawer";
import Footer from "./components/footer";
import MilitaryPreparation from "./scenes/militaryPreparation";
import Engagement from "./scenes/engagement";
import Bug from "./scenes/bug";
import CGU from "./scenes/CGU";
import PublicSupport from "./scenes/public-support-center";
import Desistement from "./scenes/desistement";
import changeSejour from "./scenes/phase1/changeSejour";
import Maintenance from "./scenes/maintenance";

import api, { initApi } from "./services/api";
import { appURL, environment, maintenance } from "./config";
import ModalCGU from "./components/modals/ModalCGU";

import "./index.css";
import { YOUNG_STATUS, ENABLE_PM, inscriptionCreationOpenForYoungs } from "./utils";
import GoogleTags from "./components/GoogleTags";
import { toastr } from "react-redux-toastr";

import { youngCanChangeSession } from "snu-lib";
import { initSentry, SentryRoute, history } from "./sentry";

initSentry();
initApi();

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
    <Router history={history}>
      <ScrollToTop />
      <GoogleTags />
      <div className="main">
        {maintenance & !localStorage?.getItem("override_maintenance") ? (
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
            <SentryRoute path="/inscription" component={Inscription} />
            {environment !== "production" ? <SentryRoute path="/inscription2023" component={Inscription2023} /> : null}
            {environment !== "production" ? <SentryRoute path="/preinscription" component={PreInscription} /> : null}
            {environment !== "production" ? <SentryRoute path="/auth" component={AuthV2} /> : <SentryRoute path="/auth" component={Auth} />}
            <SentryRoute path="/" component={Espace} />
          </Switch>
        )}
        {environment === "production" ? (
          <Footer />
        ) : ["preinscription", "auth", "inscription2023"].findIndex((route) => location.pathname.includes(route)) === -1 ? (
          <Footer />
        ) : null}
      </div>
    </Router>
  );
}

const Espace = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const young = useSelector((state) => state.Auth.young);
  useEffect(() => {
    if (young && young.acceptCGU !== "true") {
      setModal({
        isOpen: true,
        title: "Conditions générales d'utilisation",
        message: (
          <>
            <p>Les conditions générales d&apos;utilisation du SNU ont été mises à jour. Vous devez les accepter afin de continuer à accéder à votre compte SNU.</p>
            <a href={`${appURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
              Consulter les CGU ›
            </a>
          </>
        ),
        onConfirm: async () => {
          // todo add field in young model
          const { ok, code } = await api.put(`/young`, { acceptCGU: "true" });
          if (!ok) return toastr.error(`Une erreur est survenue : ${code}`);
          return toastr.success("Vous avez bien accepté les conditions générales d'utilisation.");
        },
        confirmText: "J'accepte les conditions générales d'utilisation",
      });
    }
  }, [young]);

  if (!young) {
    const redirect = encodeURIComponent(window.location.href.replace(window.location.origin, "").substring(1));
    return <Redirect to={{ search: redirect && redirect !== "logout" ? `?redirect=${redirect}` : "", pathname: "/inscription" }} />;
  }
  const youngInProcessInscription = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_ELIGIBLE].includes(young.status);

  if (!inscriptionCreationOpenForYoungs(young?.cohort) && youngInProcessInscription) return <Redirect to="/inscription" />;
  if (youngInProcessInscription) return <Redirect to="/inscription/coordonnees" />;

  return (
    <>
      <div style={{ display: "flex" }}>
        <Drawer open={menuVisible} onOpen={setMenuVisible} />
        <Content>
          <Header
            onClickBurger={() => {
              setMenuVisible(!menuVisible);
            }}
          />
          <Switch>
            <SentryRoute path="/account" component={Account} />
            <SentryRoute path="/phase1" component={Phase1} />
            <SentryRoute path="/phase2" component={Phase2} />
            <SentryRoute path="/phase3" component={Phase3} />
            <SentryRoute path="/les-programmes" component={Engagement} />
            <SentryRoute path="/preferences" component={Preferences} />
            <SentryRoute path="/mission" component={Missions} />
            <SentryRoute path="/candidature" component={Candidature} />
            <SentryRoute path="/desistement" component={Desistement} />
            <SentryRoute path="/diagoriente" component={Diagoriente} />
            {youngCanChangeSession(young) ? <SentryRoute path="/changer-de-sejour" component={changeSejour} /> : null}
            {ENABLE_PM && <SentryRoute path="/ma-preparation-militaire" component={MilitaryPreparation} />}
            <SentryRoute path="/" component={Home} />
          </Switch>
        </Content>
        <ModalCGU
          isOpen={modal?.isOpen}
          title={modal?.title}
          message={modal?.message}
          confirmText={modal?.confirmText}
          onConfirm={() => {
            modal?.onConfirm();
            setModal({ isOpen: false, onConfirm: null });
          }}
        />
      </div>
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

const Content = styled.div`
  margin-left: auto;
  width: 85%;
  max-width: calc(100% - 250px);
  @media (max-width: 768px) {
    width: 100%;
    padding: 0;
    overflow-x: hidden;
    max-width: 100%;
  }
`;
