import React from "react";
import { useSelector } from "react-redux";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import MobileEligibilite from "./mobile/stepEligibilite";
import MobileNonEligible from "./mobile/stepNonEligible";
import MobileSejour from "./mobile/stepSejour";
import MobileDocuments from "./mobile/stepDocuments";
import MobileDone from "./mobile/stepDone";
import MobileUpload from "./mobile/stepUpload";

import useDevice from "../../hooks/useDevice";

import HeaderMenu from "../../components/headerMenu";
import Footer from "./../../components/footerV2";
import Header from "./../../components/header";
import { getStepFromUrlParam, STEPS, STEP_LIST } from "./utils/navigation";

const getStepUrl = (name) => {
  return STEP_LIST.find((step) => step.name === name)?.url;
};

function renderStep(step, device) {
  if (step === STEPS.ELIGIBILITE) return device === "desktop" ? null : <MobileEligibilite />;
  if (step === STEPS.NONELIGIBLE) return device === "desktop" ? null : <MobileNonEligible />;
  if (step === STEPS.SEJOUR) return device === "desktop" ? null : <MobileSejour />;
  if (step === STEPS.DOCUMENTS) return device === "desktop" ? null : <MobileDocuments />;
  if (step === STEPS.UPLOAD) return device === "desktop" ? null : <MobileUpload />;
  if (step === STEPS.DONE) return device === "desktop" ? null : <MobileDone />;
  return device === "desktop" ? null : <MobileEligibilite />;
}

const Step = ({ young: { reinscriptionStep2023: eligibleStep } }) => {
  const device = useDevice();
  const [isOpen, setIsOpen] = React.useState(false);
  const { step } = useParams();

  if (!eligibleStep) return <Redirect to={`/home`} />;
  let currentStep = getStepFromUrlParam(step);

  if (eligibleStep === STEPS.DONE && currentStep !== STEPS.DONE) return <Redirect to={`/reinscription/${getStepUrl(STEPS.DONE)}`} />;

  const eligibleStepDetails = STEP_LIST.find((element) => element.name === eligibleStep);
  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === eligibleStep);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);

  const updatedEligibleStepIndex = eligibleStepDetails?.allowNext ? eligibleStepIndex + 1 : eligibleStepIndex;

  if (currentStepIndex > updatedEligibleStepIndex) {
    return <Redirect to={`/reinscription/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return (
    <div>
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header setIsOpen={setIsOpen} />
      {renderStep(currentStep, device)}
      {device === "desktop" && <Footer marginBottom={"0px"} />}
    </div>
  );
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  if (!young) history.push("/");

  return <SentryRoute path="/reinscription/:step?/:category?" component={() => <Step young={young} />} />;
}
