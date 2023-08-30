import React, { useContext } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import { inscriptionCreationOpenForYoungs } from "snu-lib";
import PreInscriptionContextProvider, { PreInscriptionContext } from "../../context/PreInscriptionContextProvider";
import { SentryRoute } from "../../sentry";

import StepEligibilite from "./steps/stepEligibilite";
import StepNonEligible from "./steps/stepNonEligible";
import StepSejour from "./steps/stepSejour";
import StepProfil from "./steps/stepProfil";
import StepConfirm from "./steps/stepConfirmOld";
import StepDone from "./steps/stepDoneOld";

import { useSelector } from "react-redux";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS as STEPS, PREINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";

import { environment } from "../../config";

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

  if (!inscriptionCreationOpenForYoungs("", false, environment)) {
    return <Redirect to="/" />;
  }

  return renderStepResponsive(currentStep);
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  if (young) return <Redirect to="/" />;

  return (
    <PreInscriptionContextProvider>
      <DSFRLayout title="Inscription du volontaire">
        <Switch>
          <SentryRoute path="/preinscription/:step" component={Step} />;
          <SentryRoute path="/preinscription" component={Step} />;
        </Switch>
      </DSFRLayout>
    </PreInscriptionContextProvider>
  );
}
