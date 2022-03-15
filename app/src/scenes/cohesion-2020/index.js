import React from "react";
import { Route, Switch } from "react-router-dom";
import styled from "styled-components";
import Consentements2020 from "./stepConsentements";
import Coordonnees2020 from "./stepCoordonnees";
import Particulieres2020 from "./stepParticulieres";
import Jdc2020 from "./stepJdc";
import Done2020 from "./stepDone";
import Nav2020 from "./Nav";

import { STEPS_2020 } from "../inscription/utils";

const Step2020 = ({ step }) => {
  function renderStep(step) {
    if (step === STEPS_2020.COORDONNEES) return <Coordonnees2020 />;
    if (step === STEPS_2020.PARTICULIERES) return <Particulieres2020 />;
    if (step === STEPS_2020.CONSENTEMENTS) return <Consentements2020 />;
    if (step === STEPS_2020.JDC) return <Jdc2020 />;
    if (step === STEPS_2020.DONE) return <Done2020 />;
    return <Consentements2020 />;
  }
  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ padding: "1rem", width: "100%" }}>
          <Nav2020 step={step} />
          <Wrapper>{renderStep(step)}</Wrapper>
        </div>
      </div>
    </>
  );
};

export default function Index() {
  return (
    <Switch>
      <Route path="/cohesion/consentements" component={() => <Step2020 step={STEPS_2020.CONSENTEMENTS} />} />
      <Route path="/cohesion/coordonnees" component={() => <Step2020 step={STEPS_2020.COORDONNEES} />} />
      <Route path="/cohesion/particulieres" component={() => <Step2020 step={STEPS_2020.PARTICULIERES} />} />
      <Route path="/cohesion/jdc" component={() => <Step2020 step={STEPS_2020.JDC} />} />
      <Route path="/cohesion/done" component={() => <Step2020 step={STEPS_2020.DONE} />} />
    </Switch>
  );
}

const Wrapper = styled.div`
  margin: 20px auto;
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  max-width: 1270px;
`;
