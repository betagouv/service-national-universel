import React from "react";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
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
import { colors, YOUNG_STATUS } from "../../utils";

import Home from "./Home/index.js";
import { STEPS } from "./utils";
import HelpButton from "../../components/buttons/HelpButton";

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
          <HelpButton to="/public-besoin-d-aide" color="#362f78" />
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
  // if it is a young from an old cohort, they cant access to the inscription
  if (young?.cohort && !["", "Juillet 2022", "Juin 2022", "Février 2022", "2022"].includes(young?.cohort)) {
    return <Redirect to={{ pathname: "/" }} />;
  }

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
      <Route path="/inscription/desistement" component={Desistement} />
      <Route path="/inscription" component={Home} />
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
