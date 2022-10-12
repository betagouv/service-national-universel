import React, { useState } from "react";
import { Switch, Redirect } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import useDevice from "../../hooks/useDevice";
import PreInscriptionContextProvider from "../../context/PreInscriptionContextProvider";

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

import { useSelector } from "react-redux";
import Home from "./Home";

const STEPS = {
  ELIGIBILITE: "ELIGIBILITE",
  INELIGIBLE: "INELIGIBLE",
  SEJOUR: "SEJOUR",
  PROFIL: "PROFIL",
  DONE: "DONE",
  CONFIRM: "CONFIRM",
};

const Step = ({ step }) => {
  const [isOpen, setIsOpen] = useState(false);
  const device = useDevice();

  function renderStep(step) {
    if (step === STEPS.ELIGIBILITE) return device === "desktop" ? <DesktopEligibilite /> : <MobileEligibilite />;
    if (step === STEPS.NONELIGIBLE) return device === "desktop" ? <DesktopNonEligible /> : <MobileNonEligible />;
    if (step === STEPS.SEJOUR) return device === "desktop" ? <DesktopSejour /> : <MobileSejour />;
    if (step === STEPS.PROFIL) return device === "desktop" ? <DesktopProfil /> : <MobileProfil />;
    if (step === STEPS.CONFIRM) return device === "desktop" ? <DesktopConfirm /> : <MobileConfirm />;
    if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone /> : <MobileDone />;
  }

  return (
    <div>
      <ModalMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      <Navbar step={step} />
      {renderStep(step)}
      {device === "desktop" && <Footer marginBottom={"0px"} />}
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  if (young) return <Redirect to="/" />;
  return (
    <PreInscriptionContextProvider>
      <Switch>
        <SentryRoute path="/preinscription/eligibilite" component={() => <Step step={STEPS.ELIGIBILITE} />} />
        <SentryRoute path="/preinscription/noneligible" component={() => <Step step={STEPS.NONELIGIBLE} />} />
        <SentryRoute path="/preinscription/sejour" component={() => <Step step={STEPS.SEJOUR} />} />
        <SentryRoute path="/preinscription/profil" component={() => <Step step={STEPS.PROFIL} />} />
        <SentryRoute path="/preinscription/confirm" component={() => <Step step={STEPS.CONFIRM} />} />
        <SentryRoute path="/preinscription/done" component={() => <Step step={STEPS.DONE} />} />
        <SentryRoute path="/preinscription" component={Home} />
      </Switch>
    </PreInscriptionContextProvider>
  );
}
