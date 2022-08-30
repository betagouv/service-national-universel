import React from "react";
import { Switch, Redirect, useHistory } from "react-router-dom";
import styled from "styled-components";
import Nav from "./components/Nav";
import FranceConnectCallback from "./components/FranceConnectCallback";
import Profil from "./Create/stepProfil";
import Coordonnees from "./Create/stepCoordonnees";
import Representants from "./Create/stepRepresentants";
import Particulieres from "./Create/stepParticulieres";
import Consentements from "./Create/stepConsentements";
import Documents from "./Create/stepDocuments";
import Availability from "./Create/stepAvailability";
import Done from "./Create/stepDone";
import Drawer from "./Create/drawer";
import Desistement from "../../scenes/desistement";

import { useSelector } from "react-redux";
import { colors, YOUNG_STATUS, inscriptionModificationOpenForYoungs, inscriptionCreationOpenForYoungs, COHORTS } from "../../utils";

import Home from "./Home/index.js";
import { STEPS } from "./utils";
import HelpButton from "../../components/buttons/HelpButton";
import { SentryRoute } from "../../sentry";

const Step = ({ step }) => {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  function renderStep(step) {
    if (step === STEPS.COORDONNEES) return <Coordonnees />;
    if (step === STEPS.PARTICULIERES) return <Particulieres />;
    if (step === STEPS.REPRESENTANTS) return <Representants />;
    if (step === STEPS.CONSENTEMENTS) return <Consentements />;
    if (step === STEPS.DOCUMENTS) return <Documents />;
    if (step === STEPS.AVAILABILITY) return <Availability />;
    if (step === STEPS.DONE) return <Done />;
    return <Profil />;
  }
  return (
    <div>
      <Drawer step={step} />
      <Content>
        <Nav step={step} />
        <Wrapper>{renderStep(step)}</Wrapper>
        <div className="help-button-container">
          <HelpButton to={`/public-besoin-d-aide?from=${window.location.pathname}`} color="#362f78" />
        </div>
        {young && ![YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_ELIGIBLE].includes(young?.status) ? (
          <a className="back-button" onClick={() => history.push("/")}>
            {"<"} Retour à mon espace
          </a>
        ) : null}
      </Content>
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  const allowedCohorts = COHORTS.filter((c) => inscriptionModificationOpenForYoungs(c));
  if (young?.cohort && !allowedCohorts.includes(young?.cohort)) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  // if it is a young in a status that is not eligible, they cant access to the inscription
  if (young?.status && ![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_ELIGIBLE].includes(young?.status)) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  return (
    <Switch>
      {inscriptionCreationOpenForYoungs(young?.cohort) ||
      (inscriptionModificationOpenForYoungs(young?.cohort) && [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young?.status)) ? (
        <>
          <SentryRoute path="/inscription/profil" component={() => <Step step={STEPS.PROFIL} />} />
          <SentryRoute path="/inscription/coordonnees" component={() => <Step step={STEPS.COORDONNEES} />} />
          <SentryRoute path="/inscription/particulieres" component={() => <Step step={STEPS.PARTICULIERES} />} />
          <SentryRoute path="/inscription/representants" component={() => <Step step={STEPS.REPRESENTANTS} />} />
          <SentryRoute path="/inscription/consentements" component={() => <Step step={STEPS.CONSENTEMENTS} />} />
          <SentryRoute path="/inscription/documents" component={() => <Step step={STEPS.DOCUMENTS} />} />
          <SentryRoute path="/inscription/availability" component={() => <Step step={STEPS.AVAILABILITY} />} />
          <SentryRoute path="/inscription/done" component={() => <Step step={STEPS.DONE} />} />
          <SentryRoute path="/inscription/france-connect-callback" component={() => <FranceConnectCallback />} />
          <SentryRoute path="/inscription/desistement" component={Desistement} />
          <SentryRoute path="/inscription" exact component={Home} />
        </>
      ) : (
        <>
          <SentryRoute path="/inscription" component={Home} />
        </>
      )}
    </Switch>
  );
}

const Content = styled.div`
  padding: 1rem;
  margin-left: 320px;
  .help-button-container,
  .back-button {
    display: none;
  }
  @media (max-width: 768px) {
    .help-button-container {
      display: block;
    }
    .back-button {
      display: block;
      padding: 0;
      font-size: 0.8rem;
      height: fit-content;
      color: ${colors.purple};
      font-weight: normal;
      :hover {
        text-decoration: underline;
      }
    }
    margin-left: 0;
  }
`;

const Wrapper = styled.div`
  margin: 20px auto;
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  max-width: 1270px;
`;
