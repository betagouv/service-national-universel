import React, { useContext } from "react";
import { Redirect, Switch, useHistory, useParams } from "react-router-dom";
import { inscriptionCreationOpenForYoungs } from "snu-lib";
import PreInscriptionContextProvider, { PreInscriptionContext } from "../../context/PreInscriptionContextProvider";
import { SentryRoute } from "../../sentry";

import StepEligibilite from "./steps/stepEligibilite";
import StepNonEligible from "./steps/stepNonEligible";
import StepSejour from "./steps/stepSejour";
import StepProfil from "./steps/stepProfil";
import StepConfirm from "./steps/stepConfirm";
import EmailValidation from "./EmailValidation";
import Done from "./Done";

import { useSelector } from "react-redux";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS as STEPS, PREINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import Footer from "../../components/footerV2";
import Header from "../../components/header";

import { environment } from "../../config";

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

const PreInscriptionPublic = () => {
  return (
    <Switch>
      <SentryRoute path="/preinscription/:step" component={Step} />;
      <SentryRoute path="/preinscription" component={Step} />;
    </Switch>
  );
};

const PreInscriptionWrapper = ({ children }) => {
  return (
    <PreInscriptionContextProvider>
      <div className="flex flex-col justify-between bg-beige-gris-galet-975">
        <Header />
        {children}
        <Footer />
      </div>
    </PreInscriptionContextProvider>
  );
};

export default function PreInscription() {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  if (!young)
    return (
      <PreInscriptionWrapper>
        <PreInscriptionPublic />
      </PreInscriptionWrapper>
    );
  if (young && young.emailVerified === "false") {
    return (
      <PreInscriptionWrapper>
        <EmailValidation />
      </PreInscriptionWrapper>
    );
  }
  if (young) return history.push("/inscription2023");

  return (
    <PreInscriptionWrapper>
      <Switch>
        <SentryRoute path="/preinscription/email-validation" component={EmailValidation} />;
        <SentryRoute path="/preinscription/done" component={Done} />;
        <SentryRoute path="/preinscription/" component={PreInscriptionPublic} />;
      </Switch>
    </PreInscriptionWrapper>
  );
}
