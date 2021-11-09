import React from "react";
import { Route, Switch } from "react-router-dom";
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

import Home from "./Home/index.js";
import { STEPS } from "./utils";
import HelpButton from "../../components/buttons/HelpButton";

const Step = ({ step }) => {
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
          <HelpButton to="/public-besoin-d-aide" color="#362f78" />
        </div>
      </Content>
    </div>
  );
};

export default () => {
  return (
    <Switch>
      <Route path="/inscription/profil" component={() => <Step step={STEPS.PROFIL} />} />
      <Route path="/inscription/coordonnees" component={() => <Step step={STEPS.COORDONNEES} />} />
      <Route path="/inscription/particulieres" component={() => <Step step={STEPS.PARTICULIERES} />} />
      <Route path="/inscription/representants" component={() => <Step step={STEPS.REPRESENTANTS} />} />
      <Route path="/inscription/consentements" component={() => <Step step={STEPS.CONSENTEMENTS} />} />
      <Route path="/inscription/documents" component={() => <Step step={STEPS.DOCUMENTS} />} />
      <Route path="/inscription/availability" component={() => <Step step={STEPS.AVAILABILITY} />} />
      <Route path="/inscription/done" component={() => <Step step={STEPS.DONE} />} />
      <Route path="/inscription/france-connect-callback" component={() => <FranceConnectCallback />} />
      <Route path="/inscription" component={Home} />
    </Switch>
  );
};

const Content = styled.div`
  padding: 1rem;
  margin-left: 320px;
  .help-button-container {
    display: none;
  }
  @media (max-width: 768px) {
    .help-button-container {
    display: block;
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
