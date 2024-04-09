import React, { useContext, useEffect, useState } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import Loader from "@/components/Loader";
import api from "@/services/api";
import ReinscriptionContextProvider, { ReinscriptionContext } from "../../context/ReinscriptionContextProvider";
import { SentryRoute, capture } from "../../sentry";

import { useSelector } from "react-redux";
import StepEligibilite from "../preinscription/steps/stepEligibilite";
import StepSejour from "../preinscription/steps/stepSejour";
import StepConfirm from "../preinscription/steps/stepConfirm";
import StepNoSejour from "../preinscription/steps/StepNoSejour";

import { getStepFromUrlParam, REINSCRIPTION_STEPS as STEPS, REINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { hasAccessToReinscription } from "snu-lib";
import FutureCohort from "../inscription2023/FutureCohort";

function renderStepResponsive(step) {
  if (step === STEPS.ELIGIBILITE) return <StepEligibilite />;
  if (step === STEPS.SEJOUR) return <StepSejour />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
  if (step === STEPS.NO_SEJOUR) return <StepNoSejour />;
}

const Step = () => {
  const [data, updateValue] = useContext(ReinscriptionContext);
  const young = useSelector((state) => state.Auth.young);
  useEffect(() => {
    updateValue({
      ...data,
      birthDate: young.birthdateAt,
      zip: young.zip,
      frenchNationality: young.frenchNationality,
    });
  }, []);

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
  const [isReinscriptionOpen, setReinscriptionOpen] = useState(false);
  const [isReinscriptionOpenLoading, setReinscriptionOpenLoading] = useState(true);
  const young = useSelector((state) => state.Auth.young);

  const fetchInscriptionOpen = async () => {
    try {
      const { ok, data, code } = await api.get(`/cohort-session/isInscriptionOpen`);
      if (!ok) {
        capture(new Error(code));
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setReinscriptionOpen(data);
      setReinscriptionOpenLoading(false);
    } catch (e) {
      setReinscriptionOpenLoading(false);
    }
  };

  useEffect(() => {
    fetchInscriptionOpen();
  }, []);

  if (!hasAccessToReinscription(young)) return <Redirect to="/" />;

  if (isReinscriptionOpenLoading) return <Loader />;

  if (!isReinscriptionOpen) return <FutureCohort />;

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
