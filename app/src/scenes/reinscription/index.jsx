import React, { useContext } from "react";
import { Link, Redirect, Switch, useParams } from "react-router-dom";
import Loader from "@/components/Loader";
import ReinscriptionContextProvider, { ReinscriptionContext } from "../../context/ReinscriptionContextProvider";
import { SentryRoute } from "../../sentry";

import StepEligibilite from "../preinscription/steps/stepEligibilite";
import StepSejour from "../preinscription/steps/stepSejour";
import StepConfirm from "../preinscription/steps/stepConfirm";
import StepNoSejour from "../preinscription/steps/stepNoSejour";

import { getStepFromUrlParam, REINSCRIPTION_STEPS as STEPS, REINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import useReinscription from "../changeSejour/lib/useReinscription";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";

function renderStepResponsive(step) {
  if (step === STEPS.ELIGIBILITE) return <StepEligibilite />;
  if (step === STEPS.SEJOUR) return <StepSejour />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
  if (step === STEPS.NO_SEJOUR) return <StepNoSejour />;
}

const Step = () => {
  const [data] = useContext(ReinscriptionContext);

  const { step } = useParams();

  const currentStep = getStepFromUrlParam(step, STEP_LIST, true);
  if (!currentStep) return <Redirect to="/reinscription" />;

  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === data.step);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);
  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/reinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return renderStepResponsive(currentStep);
};

export default function ReInscription() {
  const { data: isReinscriptionOpen, isPending, isError } = useReinscription();

  if (isPending) return <Loader />;
  if (isError) return <div>Erreur</div>;
  if (!isReinscriptionOpen) return <Fallback />;

  return (
    <ReinscriptionContextProvider>
      <DSFRLayout title="Reinscription du volontaire">
        <Switch>
          <SentryRoute path="/reinscription/:step" component={Step} />;
          <SentryRoute path="/reinscription" component={Step} />;
        </Switch>
      </DSFRLayout>
    </ReinscriptionContextProvider>
  );
}

function Fallback() {
  return (
    <DSFRLayout title="Reinscription du volontaire">
      <DSFRContainer title="Réinscription indisponible">
        <p>Vous n'avez actuellement pas accès à la réinscription.</p>
        <p>
          Pas de panique, <Link to="/">cliquez ici pour reprendre votre parcours</Link>.
        </p>
        <br />
      </DSFRContainer>
    </DSFRLayout>
  );
}
