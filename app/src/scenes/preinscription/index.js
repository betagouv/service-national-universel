import React, { useContext, useState } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import PreInscriptionContextProvider, { PreInscriptionContext } from "../../context/PreInscriptionContextProvider";
import { SentryRoute } from "../../sentry";

import DesktopConfirm from "./desktop/stepConfirm";
import DesktopDone from "./desktop/stepDone";
import DesktopEligibilite from "./desktop/stepEligibilite";
import DesktopNonEligible from "./desktop/stepNonEligible";
import DesktopProfil from "./desktop/stepProfil";
import DesktopSejour from "./desktop/stepSejour";

import MobileConfirm from "./mobile/stepConfirm";
import MobileDone from "./mobile/stepDone";
import MobileEligibilite from "./mobile/stepEligibilite";
import MobileNonEligible from "./mobile/stepNonEligible";
import MobileProfil from "./mobile/stepProfil";
import MobileSejour from "./mobile/stepSejour";

import StepEligibilite from "./steps/stepEligibilite";
import StepNonEligible from "./steps/stepNonEligible";
import StepSejour from "./steps/stepSejour";
import StepProfil from "./steps/stepProfil";
import StepConfirm from "./steps/stepConfirm";
import StepDone from "./steps/stepDone";

import { useSelector } from "react-redux";
import { inscriptionCreationOpenForYoungs } from "snu-lib";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS as STEPS, PREINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import useDevice from "../../hooks/useDevice";
import Footer from "../../components/footerV2";
import Header from "../../components/header";
import { environment } from "../../config";
import ModalMenu from "../../components/headerMenu";
import Navbar from "./components/navbar";

function renderStepResponsive(step) {
  if (step === STEPS.ELIGIBILITE) return <StepEligibilite />;
  if (step === STEPS.INELIGIBLE) return <StepNonEligible />;
  if (step === STEPS.SEJOUR) return <StepSejour />;
  if (step === STEPS.PROFIL) return <StepProfil />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
  if (step === STEPS.DONE) return <StepDone />;
}

function renderStep(step, device) {
  if (step === STEPS.ELIGIBILITE) return device === "desktop" ? <DesktopEligibilite /> : <MobileEligibilite />;
  if (step === STEPS.INELIGIBLE) return device === "desktop" ? <DesktopNonEligible /> : <MobileNonEligible />;
  if (step === STEPS.SEJOUR) return device === "desktop" ? <DesktopSejour /> : <MobileSejour />;
  if (step === STEPS.PROFIL) return device === "desktop" ? <DesktopProfil /> : <MobileProfil />;
  if (step === STEPS.CONFIRM) return device === "desktop" ? <DesktopConfirm /> : <MobileConfirm />;
  if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone /> : <MobileDone />;
}

const Step = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data] = useContext(PreInscriptionContext);
  const device = useDevice();
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

  if (environment === "production")
    return (
      <div className="flex flex-col h-screen justify-between md:!bg-[#f9f6f2] bg-white">
        <ModalMenu isOpen={isOpen} setIsOpen={setIsOpen} />
        <Header setIsOpen={setIsOpen} />
        <Navbar />
        {renderStep(currentStep, device)}
        {device === "desktop" && <Footer />}
      </div>
    );
  return renderStepResponsive(currentStep);
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (young) return <Redirect to="/" />;

  if (environment === "production")
    return (
      <PreInscriptionContextProvider>
        <Switch>
          <SentryRoute path="/preinscription/:step" component={Step} />;
          <SentryRoute path="/preinscription" component={Step} />;
        </Switch>
      </PreInscriptionContextProvider>
    );

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
