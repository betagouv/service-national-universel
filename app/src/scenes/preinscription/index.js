import React, { useState, useContext } from "react";
import { Switch, Redirect, useParams } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import useDevice from "../../hooks/useDevice";
import PreInscriptionContextProvider, { PreInscriptionContext } from "../../context/PreInscriptionContextProvider";

import DesktopEligibilite from "./desktop/stepEligibilite";
import DesktopNonEligible from "./desktop/stepNonEligible";
import DesktopSejour from "./desktop/stepSejour";
import DesktopProfil from "./desktop/stepProfil";
import DesktopConfirm from "./desktop/stepConfirm";
import DesktopDone from "./desktop/stepDone";

import MobileEligibilite from "./mobile/stepEligibilite";
import MobileNonEligible from "./mobile/stepNonEligible";
import MobileSejour from "./mobile/stepSejour";
import MobileProfil from "./mobile/stepProfil";
import MobileConfirm from "./mobile/stepConfirm";
import MobileDone from "./mobile/stepDone";

import Header from "./../../components/header";
import Navbar from "./components/navbar";
import ModalMenu from "../../components/headerMenu";
import Footer from "./../../components/footerV2";
import { getStepFromUrlParam, getStepUrl, PREINSCRIPTION_STEPS as STEPS, PREINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";

import { useSelector } from "react-redux";
import Home from "./Home";

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

  const currentStep = getStepFromUrlParam(step, STEP_LIST);

  if (!currentStep) return <Redirect to="/preinscription" />;

  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === data.step);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);

  console.log({ currentStep, eligibleStep: data.step, eligibleStepIndex, currentStepIndex });

  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/preinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return (
    <div>
      <ModalMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      <Navbar />
      {renderStep(currentStep, device)}
      {device === "desktop" && <Footer />}
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (young) return <Redirect to="/" />;

  return (
    <PreInscriptionContextProvider>
      <Switch>
        <SentryRoute path="/preinscription/:step" component={Step} />;
        <SentryRoute path="/preinscription" component={Home} />
      </Switch>
    </PreInscriptionContextProvider>
  );
}
