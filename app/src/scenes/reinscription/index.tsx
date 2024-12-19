import React, { useContext } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
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
import ReinscriptionClosed from "./ReinscriptionClosed";
import useAuth from "@/services/useAuth";
import { YOUNG_STATUS } from "snu-lib";
import StepWaitingConsent from "../inscription2023/steps/stepDone";

function renderStep(step: string) {
  if (step === STEPS.ELIGIBILITE) return <StepEligibilite />;
  if (step === STEPS.SEJOUR) return <StepSejour />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
  if (step === STEPS.NO_SEJOUR) return <StepNoSejour />;
  return <Redirect to="/reinscription" />;
}

const Step = () => {
  const [data] = useContext(ReinscriptionContext);

  const { step }: { step: string } = useParams();

  const currentStep = getStepFromUrlParam(step, STEP_LIST, true);
  if (!currentStep) return <Redirect to="/reinscription" />;

  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === data.step);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);
  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/reinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return renderStep(currentStep);
};

export default function Reinscription() {
  const { data: isReinscriptionOpen, isPending, isError } = useReinscription();
  const { young } = useAuth();

  if (young.status === YOUNG_STATUS.NOT_AUTORISED) {
    return (
      <DSFRLayout title="Reinscription du volontaire">
        <StepWaitingConsent />
      </DSFRLayout>
    );
  }

  return (
    <ReinscriptionContextProvider>
      <DSFRLayout title="Reinscription du volontaire">
        {isPending ? (
          <Loader />
        ) : isError ? (
          <p>Impossible de déterminer si la réinscription est ouverte.</p>
        ) : isReinscriptionOpen ? (
          <Switch>
            <SentryRoute path="/reinscription/:step" component={Step} />
            <SentryRoute path="/reinscription" component={Step} />
          </Switch>
        ) : (
          <ReinscriptionClosed />
        )}
      </DSFRLayout>
    </ReinscriptionContextProvider>
  );
}
