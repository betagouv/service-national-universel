import React, { useContext } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import PreInscriptionContextProvider, { PreInscriptionContext } from "../../context/PreInscriptionContextProvider";
import { SentryRoute } from "../../sentry";

import StepEligibilite from "./steps/stepEligibilite";
import StepNonEligible from "./steps/stepNonEligible";
import StepSejour from "./steps/stepSejour";
import StepProfil from "./steps/stepProfil";
import StepConfirm from "./steps/stepConfirm";
import StepDone from "./steps/stepDone";

import { useSelector } from "react-redux";
import { inscriptionCreationOpenForYoungs } from "snu-lib";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS as STEPS, PREINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import Footer from "../../components/footerV2";
import Header from "../../components/header";

function renderStepResponsive(step) {
  if (step === STEPS.ELIGIBILITE) return <StepEligibilite />;
  if (step === STEPS.INELIGIBLE) return <StepNonEligible />;
  if (step === STEPS.SEJOUR) return <StepSejour />;
  if (step === STEPS.PROFIL) return <StepProfil />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
  if (step === STEPS.DONE) return <StepDone />;
}

const Step = () => {
  const [data] = useContext(PreInscriptionContext);
  const { step } = useParams();

  const currentStep = getStepFromUrlParam(step, STEP_LIST, true);

  if (!currentStep) return <Redirect to="/preinscription" />;

  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === data.step);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);

  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/preinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  if (!inscriptionCreationOpenForYoungs()) {
    return <Redirect to="/" />;
  }

  return renderStepResponsive(currentStep);
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (young) return <Redirect to="/" />;

  return (
    <PreInscriptionContextProvider>
      <div className="flex flex-col min-h-screen justify-between bg-beige-gris-galet-975">
        <Header />
        <Switch>
          <SentryRoute path="/preinscription/:step" component={Step} />;
          <SentryRoute path="/preinscription" component={Step} />;
        </Switch>
        <Footer />
      </div>
    </PreInscriptionContextProvider>
  );
}
