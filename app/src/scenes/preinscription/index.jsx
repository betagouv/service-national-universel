import React, { useContext, useState, useEffect } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import api from "@/services/api";
import PreInscriptionContextProvider, { PreInscriptionContext } from "../../context/PreInscriptionContextProvider";
import { SentryRoute, capture } from "../../sentry";

import StepEligibilite from "./steps/stepEligibilite";
import StepNonEligible from "./steps/stepNonEligible";
import StepSejour from "./steps/stepSejour";
import StepProfil from "./steps/stepProfil";
import StepConfirm from "./steps/stepConfirm";
import EmailValidation from "./EmailValidation";
import Done from "./Done";

import { useSelector } from "react-redux";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS as STEPS, PREINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import Loader from "@/components/Loader";
import { toastr } from "react-redux-toastr";

function renderStepResponsive(step) {
  if (step === STEPS.ELIGIBILITE) return <StepEligibilite />;
  if (step === STEPS.INELIGIBLE) return <StepNonEligible />;
  if (step === STEPS.SEJOUR) return <StepSejour />;
  if (step === STEPS.PROFIL) return <StepProfil />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
}

const Step = () => {
  const [data] = useContext(PreInscriptionContext);
  const { step } = useParams();

  const [isInscriptionOpen, setInscriptionOpen] = useState(false);
  const [isInscriptionOpenLoading, setInscriptionOpenLoading] = useState(true);
  const fetchInscriptionOpen = async () => {
    try {
      const { ok, data, code } = await api.get(`/cohort-session/isInscriptionOpen?timeZoneOffset=${new Date().getTimezoneOffset()}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setInscriptionOpen(data);
      setInscriptionOpenLoading(false);
    } catch (e) {
      setInscriptionOpenLoading(false);
    }
  };

  useEffect(() => {
    fetchInscriptionOpen();
  }, []);

  const currentStep = getStepFromUrlParam(step, STEP_LIST, true);

  if (!currentStep) return <Redirect to="/preinscription" />;

  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === data.step);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);

  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/preinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  if (isInscriptionOpenLoading) return <Loader />;

  if (!isInscriptionOpen) return <Redirect to="/" />;

  return renderStepResponsive(currentStep);
};

const PreInscriptionPublic = () => {
  const young = useSelector((state) => state.Auth.young);
  if (young && young.emailVerified === "false") return <Redirect to="/preinscription/email-validation" />;
  if (young) return <Redirect to="/inscription2023" />;

  return (
    <Switch>
      <SentryRoute path="/preinscription/:step" component={Step} />;
      <SentryRoute path="/preinscription" component={Step} />;
    </Switch>
  );
};

const PreInscriptionPrivate = () => {
  const young = useSelector((state) => state.Auth.young);
  if (!young) return <Redirect to="/preinscription" />;
  return (
    <Switch>
      <SentryRoute path="/preinscription/email-validation" component={EmailValidation} />;
      <SentryRoute path="/preinscription/done" component={Done} />;
    </Switch>
  );
};

export default function PreInscription() {
  return (
    <PreInscriptionContextProvider>
      <DSFRLayout title="Inscription du volontaire">
        <Switch>
          <SentryRoute path={["/preinscription/email-validation", "/preinscription/done"]} component={PreInscriptionPrivate} />;
          <SentryRoute path="/preinscription/" component={PreInscriptionPublic} />;
        </Switch>
      </DSFRLayout>
    </PreInscriptionContextProvider>
  );
}
