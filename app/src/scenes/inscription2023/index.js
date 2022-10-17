import React from "react";
import { useSelector } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import DesktopConfirm from "./desktop/stepConfirm";
import DesktopConsentements from "./desktop/stepConsentements";
import DesktopCoordonnees from "./desktop/stepCoordonnees";
import DesktopDocuments from "./desktop/stepDocuments";
import DesktopDone from "./desktop/stepDone";
import DesktopRepresentants from "./desktop/stepRepresentants";
import DesktopUpload from "./desktop/stepUpload";

import MobileConfirm from "./mobile/stepConfirm";
import MobileConsentements from "./mobile/stepConsentements";
import MobileCoordonnees from "./mobile/stepCoordonnees";
import MobileDocuments from "./mobile/stepDocuments";
import MobileDone from "./mobile/stepDone";
import MobileRepresentants from "./mobile/stepRepresentants";
import MobileUpload from "./mobile/stepUpload";

import useDevice from "../../hooks/useDevice";

import HeaderMenu from "../../components/headerMenu";
import Footer from "./../../components/footerV2";
import Header from "./../../components/header";
import { getStepFromUrlParam, getStepUrl, INSCRIPTION_STEPS as STEPS, INSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";

function renderStep(step, device) {
  if (step === STEPS.COORDONNEES) return device === "desktop" ? <DesktopCoordonnees /> : <MobileCoordonnees />;
  if (step === STEPS.REPRESENTANTS) return device === "desktop" ? <DesktopRepresentants /> : <MobileRepresentants />;
  if (step === STEPS.CONSENTEMENTS) return device === "desktop" ? <DesktopConsentements /> : <MobileConsentements />;
  if (step === STEPS.DOCUMENTS) return device === "desktop" ? <DesktopDocuments /> : <MobileDocuments />;
  if (step === STEPS.UPLOAD) return device === "desktop" ? <DesktopUpload /> : <MobileUpload />;
  if (step === STEPS.CONFIRM) return device === "desktop" ? <DesktopConfirm /> : <MobileConfirm />;
  if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone /> : <MobileDone />;
  return device === "desktop" ? <DesktopCoordonnees /> : <MobileCoordonnees />;
}

const Step = ({ young: { inscriptionStep2023: eligibleStep } }) => {
  const device = useDevice();
  const [isOpen, setIsOpen] = React.useState(false);
  const { step } = useParams();

  const requestedStep = getStepFromUrlParam(step, STEP_LIST);

  if (!requestedStep && eligibleStep) {
    return <Redirect to={`/inscription2023/${getStepUrl(eligibleStep, STEP_LIST)}`} />;
  }

  const currentStep = requestedStep || STEP_LIST[0].name;

  if (eligibleStep === STEPS.DONE && currentStep !== STEPS.DONE) return <Redirect to={`/inscription2023/${getStepUrl(STEPS.DONE, STEP_LIST)}`} />;

  const eligibleStepDetails = STEP_LIST.find((element) => element.name === eligibleStep);
  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === eligibleStep);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);

  const updatedEligibleStepIndex = eligibleStepDetails.allowNext ? eligibleStepIndex + 1 : eligibleStepIndex;

  if (currentStepIndex > updatedEligibleStepIndex) {
    return <Redirect to={`/inscription2023/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return (
    <div className="flex flex-col h-screen justify-between md:bg-[#f9f6f2] bg-white">
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      {renderStep(currentStep, device)}
      {device === "desktop" && <Footer marginBottom={"0px"} />}
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (!young) return <Redirect to="/preinscription" />;

  return <SentryRoute path="/inscription2023/:step?/:category?" component={() => <Step young={young} />} />;
}
