import React, { useContext, useState, useEffect } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import api from "@/services/api";
import ReinscriptionContextProvider, { ReinscriptionContext } from "../../context/ReinscriptionContextProvider";
import { SentryRoute, capture } from "../../sentry";

import StepEligibilite from "./steps/stepEligibilite";
// import StepNonEligible from "./steps/stepNonEligible";
import StepSejour from "./steps/stepSejour";
import StepConfirm from "./steps/stepConfirm";

import { useSelector } from "react-redux";
import { getStepFromUrlParam, REINSCRIPTION_STEPS as STEPS, REINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import Loader from "@/components/Loader";
import { toastr } from "react-redux-toastr";

function renderStepResponsive(step) {
  if (step === STEPS.ELIGIBILITE) return <StepEligibilite />;
  //   if (step === STEPS.INELIGIBLE) return <StepNonEligible />;
  if (step === STEPS.SEJOUR) return <StepSejour />;
  //   if (step === STEPS.PROFIL) return <StepProfil />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
}

const Step = () => {
  const [data] = useContext(ReinscriptionContext);
  const { step } = useParams();

  const [isReinscriptionOpen, setReinscriptionOpen] = useState(false);
  const [isReinscriptionOpenLoading, setReinscriptionOpenLoading] = useState(true);
  const fetchReinscriptionOpen = async () => {
    try {
      const { ok, data, code } = await api.get(`/cohort-session/isInscriptionOpen`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setReinscriptionOpen(data);
      setReinscriptionOpenLoading(false);
    } catch (e) {
      setReinscriptionOpenLoading(false);
    }
  };

  useEffect(() => {
    fetchReinscriptionOpen();
  }, []);

  const currentStep = getStepFromUrlParam(step, STEP_LIST, true);

  if (!currentStep) return <Redirect to="/reinscription" />;

  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === data.step);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);

  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/reinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  if (isReinscriptionOpenLoading) return <Loader />;

  if (!isReinscriptionOpen) return <Redirect to="/" />;

  return renderStepResponsive(currentStep);
};

const ReinscriptionPublic = () => {
  const young = useSelector((state) => state.Auth.young);
  //   if (young && young.emailVerified === "false") return <Redirect to="/preinscription/email-validation" />;
  if (young) return <Redirect to="/reinscription" />;

  return (
    <Switch>
      <SentryRoute path="/reinscription/:step" component={Step} />;
      <SentryRoute path="/reinscription" component={Step} />;
    </Switch>
  );
};

const PreInscriptionPrivate = () => {
  const young = useSelector((state) => state.Auth.young);
  if (!young) return <Redirect to="/preinscription" />;
  return (
    <Switch>
      {/* <SentryRoute path="/preinscription/email-validation" component={EmailValidation} />; */}
      <SentryRoute path="/reinscription/done" component={Done} />;
    </Switch>
  );
};

export default function PreInscription() {
  return (
    <ReinscriptionContextProvider>
      <DSFRLayout title="Reinscription du volontaire">
        <Switch>
          <SentryRoute path={["/preinscription/email-validation", "/preinscription/done"]} component={PreInscriptionPrivate} />;
          <SentryRoute path="/reinscription/" component={ReinscriptionPublic} />;
        </Switch>
      </DSFRLayout>
    </ReinscriptionContextProvider>
  );
}
