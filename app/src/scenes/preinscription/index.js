import React, { useContext, useState } from "react";
import { Redirect, Switch, useParams } from "react-router-dom";
import PreInscriptionContextProvider, { PreInscriptionContext } from "../../context/PreInscriptionContextProvider";
import useDevice from "../../hooks/useDevice";
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

import ModalMenu from "../../components/headerMenu";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS as STEPS, PREINSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import Footer from "./../../components/footerV2";
import Header from "./../../components/header";
import Navbar from "./components/navbar";

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

  if (currentStepIndex > eligibleStepIndex) {
    return <Redirect to={`/preinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return (
    <div className="flex flex-col h-screen justify-between md:!bg-[#f9f6f2] bg-white">
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
