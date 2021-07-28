import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Sentry from "@sentry/browser";
import queryString from "query-string";
import styled from "styled-components";

import { setYoung } from "./redux/auth/actions";

import Account from "./scenes/account";
import Auth from "./scenes/auth";
import Home from "./scenes/home";
import Inscription from "./scenes/inscription";
import Phase1 from "./scenes/phase1";
import Phase2 from "./scenes/phase2";
import Phase3 from "./scenes/phase3";
import Diagoriente from "./scenes/diagoriente";
import Documents from "./scenes/documents";
import Preferences from "./scenes/preferences";
import Missions from "./scenes/missions";
import Applications from "./scenes/applications";
import Cohesion from "./scenes/cohesion-2020/";
import Contract from "./scenes/contract";
import ContractDone from "./scenes/contract/done";
import Loader from "./components/Loader";
import Header from "./components/header";
import Drawer from "./components/drawer";
import Footer from "./components/footer";
import MilitaryPreparation from "./scenes/militaryPreparation";

import api from "./services/api";
import { SENTRY_URL, environment } from "./config";

import "./index.css";
import { YOUNG_STATUS, setCrispUserData, ENABLE_PM } from "./utils";

if (environment === "production") Sentry.init({ dsn: SENTRY_URL, environment: "app" });

export default () => {
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
        if (token) api.setToken(token);
        if (ok && user) {
          dispatch(setYoung(user));
          setCrispUserData(user);
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
    <Router>
      <ScrollToTop />
      <div className="main">
        <Switch>
          <Route path="/validate-contract/done" component={ContractDone} />
          <Route path="/validate-contract" component={Contract} />

          <Route path="/inscription" component={Inscription} />
          <Route path="/auth" component={Auth} />
          <Route path="/" component={Espace} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
};

const Espace = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  if (!young) return <Redirect to="/inscription" />;
  if (young.status === YOUNG_STATUS.IN_PROGRESS) return <Redirect to="/inscription/coordonnees" />;

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
            <Route path="/account" component={Account} />
            <Route path="/phase1" component={Phase1} />
            <Route path="/phase2" component={Phase2} />
            <Route path="/phase3" component={Phase3} />
            <Route path="/documents" component={Documents} />
            <Route path="/preferences" component={Preferences} />
            <Route path="/mission" component={Missions} />
            <Route path="/candidature" component={Applications} />
            <Route path="/cohesion" component={Cohesion} />
            <Route path="/diagoriente" component={Diagoriente} />
            {ENABLE_PM && <Route path="/ma-preparation-militaire" component={MilitaryPreparation} />}
            <Route path="/" component={Home} />
          </Switch>
        </Content>
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
