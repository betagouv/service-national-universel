import React, { useState, useEffect } from "react";
import { Switch } from "react-router-dom";
import { SentryRoute, capture } from "../../sentry";
import useDevice from "../../hooks/useDevice";
import PreInscriptionContextProvider from "../../context/PreInscriptionContextProvider";

import DesktopEligibilite from "./desktop/stepEligibilite";
import DesktopSejour from "./desktop/stepSejour";
import DesktopProfil from "./desktop/stepProfil";
import DesktopDone from "./desktop/stepDone";

import MobileEligibilite from "./mobile/stepEligibilite";
import MobileSejour from "./mobile/stepSejour";
import MobileProfil from "./mobile/stepProfil";
import MobileDone from "./mobile/stepDone";

import Header from "./components/header";
import Navbar from "./components/navbar";
import ModalMenu from "./components/modals/modalMenu";

const STEPS = {
  ELIGIBILITE: "ELIGIBILITE",
  SEJOUR: "SEJOUR",
  PROFIL: "PROFIL",
  DONE: "DONE",
};

const Step = ({ step }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEligible, setIsEligible] = useState(true);
  const device = "mobile"; //useDevice();

  //A terminer
  useEffect(() => {
    const getData = async () => {
      try {
        // requête
        // setIsEligible(data.isEligible)
        //
      } catch (error) {
        capture(error);
      }
    };
    getData();
  }, []);

  function renderStep(step) {
    if (step === STEPS.ELIGIBILITE) return device === "desktop" ? <DesktopEligibilite /> : <MobileEligibilite />;
    if (step === STEPS.SEJOUR) return device === "desktop" ? <DesktopSejour /> : <MobileSejour />;
    if (step === STEPS.PROFIL) return device === "desktop" ? <DesktopProfil /> : <MobileProfil />;
    if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone /> : <MobileDone />;
  }

  return (
    <div>
      <ModalMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      <Navbar isEligible={isEligible} step={step} />
      {renderStep(step)}
      {/* footer */}
    </div>
  );
};

export default function Index() {
  return (
    <PreInscriptionContextProvider>
      <Switch>
        <SentryRoute path="/preinscription/eligibilite" component={() => <Step step={STEPS.ELIGIBILITE} />} />
        <SentryRoute path="/preinscription/sejour" component={() => <Step step={STEPS.SEJOUR} />} />
        <SentryRoute path="/preinscription/profil" component={() => <Step step={STEPS.PROFIL} />} />
        <SentryRoute path="/preinscription/done" component={() => <Step step={STEPS.DONE} />} />
        <SentryRoute path="/preinscription" component={() => <Step step={STEPS.ELIGIBILITE} />} />
      </Switch>
    </PreInscriptionContextProvider>
  );
}
