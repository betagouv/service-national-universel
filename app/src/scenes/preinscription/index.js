import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";
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

const STEPS = {
  ELIGIBILITE: "ELIGIBILITE",
  SEJOUR: "SEJOUR",
  PROFIL: "PROFIL",
  DONE: "DONE",
};

const Step = ({ step }) => {
  const device = "mobile"; //useDevice();

  function renderStep(step) {
    if (step === STEPS.ELIGIBILITE) return device === "desktop" ? <DesktopEligibilite /> : <MobileEligibilite />;
    if (step === STEPS.SEJOUR) return device === "desktop" ? <DesktopSejour /> : <MobileSejour />;
    if (step === STEPS.PROFIL) return device === "desktop" ? <DesktopProfil /> : <MobileProfil />;
    if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone /> : <MobileDone />;
  }

  return (
    <div>
      {/* header */}
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
