import React from "react";
import { Route, Switch } from "react-router-dom";
import Profil from "./Create/stepProfil";
import Coordonnees from "./Create/stepCoordonnees";
import Representants from "./Create/stepRepresentants";
import Particulieres from "./Create/stepParticulieres";
import Consentements from "./Create/stepConsentements";
import Motivations from "./Create/stepMotivations";
import Nav from "./components/Nav";
import Done from "./Create/stepDone";
import styled from "styled-components";

import Drawer from "./Create/drawer";

import Home from "./Home/index.js";
import { STEPS } from "./utils";

const Step = ({ step }) => {
  function renderStep(step) {
    if (step === STEPS.COORDONNEES) return <Coordonnees />;
    if (step === STEPS.PARTICULIERES) return <Particulieres />;
    if (step === STEPS.REPRESENTANTS) return <Representants />;
    if (step === STEPS.CONSENTEMENTS) return <Consentements />;
    if (step === STEPS.MOTIVATIONS) return <Motivations />;
    if (step === STEPS.DONE) return <Done />;
    return <Profil />;
  }
  return (
    <div>
      <Drawer step={step} />
      <Content>
        <Nav step={step} />
        <Wrapper>{renderStep(step)}</Wrapper>
      </Content>
    </div>
  );
};

export default () => {
  return (
    <Switch>
      <Route path="/inscription/create" component={() => <Step step={STEPS.PROFIL} />} />
      <Route path="/inscription/coordonnees" component={() => <Step step={STEPS.COORDONNEES} />} />
      <Route path="/inscription/situations-particulieres" component={() => <Step step={STEPS.PARTICULIERES} />} />
      <Route path="/inscription/representants" component={() => <Step step={STEPS.REPRESENTANTS} />} />
      <Route path="/inscription/consentements" component={() => <Step step={STEPS.CONSENTEMENTS} />} />
      <Route path="/inscription/motivations" component={() => <Step step={STEPS.MOTIVATIONS} />} />
      <Route path="/inscription/done" component={() => <Step step={STEPS.DONE} />} />
      <Route path="/inscription" component={Home} />
    </Switch>
  );
};

const Content = styled.div`
  padding: 1rem;
  margin-left: 320px;
  @media (max-width: 768px) {
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
