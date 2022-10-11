import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import DesktopConfirm from "./desktop/stepConfirm";
import DesktopConsentements from "./desktop/stepConsentements";
import DesktopCoordonnees from "./desktop/stepCoordonnees";
import DesktopDocuments from "./desktop/stepDocuments";
import DesktopDone from "./desktop/stepDone";
import DesktopRepresentants from "./desktop/stepRepresentants";
import DesktopWaitingConsent from "./desktop/StepWaitingConsent";

import MobileConfirm from "./mobile/stepConfirm";
import MobileConsentements from "./mobile/stepConsentements";
import MobileCoordonnees from "./mobile/stepCoordonnees";
import MobileDocuments from "./mobile/stepDocuments";
import MobileDone from "./mobile/stepDone";
import MobileRepresentants from "./mobile/stepRepresentants";
import MobileWaitingConsent from "./mobile/StepWaitingConsent";

import useDevice from "../../hooks/useDevice";

import HeaderMenu from "../../components/headerMenu";
import Footer from "./../../components/footerV2";
import Header from "./../../components/header";
import Help from "./components/Help";

const STEPS = {
  COORDONNEES: "COORDONNEES",
  CONSENTEMENTS: "CONSENTEMENTS",
  REPRESENTANTS: "REPRESENTANTS",
  DOCUMENTS: "DOCUMENTS",
  CONFIRM: "CONFIRM",
  WAITING_CONSENT: "WAITING_CONSENT",
  DONE: "DONE",
};

const Step = ({ step }) => {
  const device = useDevice();
  const [isOpen, setIsOpen] = React.useState(false);

  function renderStep(step) {
    if (step === STEPS.COORDONNEES) return device === "desktop" ? <DesktopCoordonnees step={step} /> : <MobileCoordonnees step={step} />;
    if (step === STEPS.REPRESENTANTS) return device === "desktop" ? <DesktopRepresentants step={step} /> : <MobileRepresentants step={step} />;
    if (step === STEPS.CONSENTEMENTS) return device === "desktop" ? <DesktopConsentements step={step} /> : <MobileConsentements step={step} />;
    if (step === STEPS.DOCUMENTS) return device === "desktop" ? <DesktopDocuments step={step} /> : <MobileDocuments step={step} />;
    if (step === STEPS.CONFIRM) return device === "desktop" ? <DesktopConfirm /> : <MobileConfirm />;
    if (step === STEPS.WAITING_CONSENT) return device === "desktop" ? <DesktopWaitingConsent /> : <MobileWaitingConsent />;
    if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone /> : <MobileDone />;

    return device === "desktop" ? <DesktopCoordonnees step={step} /> : <MobileCoordonnees step={step} />;
  }

  return (
    <div>
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      {renderStep(step)}
      {device === "desktop" && <Footer marginBottom={"0px"} />}
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  if (!young) return <Redirect to="/preinscription" />;
  console.log(young);

  return (
    <Switch>
      <SentryRoute path="/inscription2023/coordonnee" component={() => <Step step={STEPS.COORDONNEES} />} />
      <SentryRoute path="/inscription2023/representants" component={() => <Step step={STEPS.REPRESENTANTS} />} />
      <SentryRoute path="/inscription2023/consentement" component={() => <Step step={STEPS.CONSENTEMENTS} />} />
      <SentryRoute path="/inscription2023/documents" component={() => <Step step={STEPS.DOCUMENTS} />} />
      <SentryRoute path="/inscription2023/confirm" component={() => <Step step={STEPS.CONFIRM} />} />
      <SentryRoute path="/inscription2023/attente-consentement" component={() => <Step step={STEPS.WAITING_CONSENT} />} />
      <SentryRoute path="/inscription2023/done" component={() => <Step step={STEPS.DONE} />} />
      {/* Redirect vers home */}
      <SentryRoute path="/inscription2023" component={() => <Step step={STEPS.COORDONNEES} />} />
    </Switch>
  );
}
