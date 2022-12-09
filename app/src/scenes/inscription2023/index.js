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

import MobileUpload from "./mobile/stepUpload";

import DesktopCorrectionEligibilite from "./desktop/correction/stepEligibilite";
import DesktopCorrectionProfil from "./desktop/correction/stepProfil";

import MobileCorrectionEligibilite from "./mobile/correction/stepEligibilite";
import MobileCorrectionProfil from "./mobile/correction/stepProfil";

import useDevice from "../../hooks/useDevice";

import { getStepFromUrlParam, getStepUrl, CORRECTION_STEPS, CORRECTION_STEPS_LIST, INSCRIPTION_STEPS as STEPS, INSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import { YOUNG_STATUS, inscriptionModificationOpenForYoungs } from "snu-lib";

function renderStep(step, device) {
  if (step === STEPS.COORDONNEES) return <DesktopCoordonnees />;
  if (step === STEPS.REPRESENTANTS) return <DesktopRepresentants />;
  if (step === STEPS.CONSENTEMENTS) return <DesktopConsentements />;
  if (step === STEPS.DOCUMENTS) return <DesktopDocuments />;
  if (step === STEPS.UPLOAD) return device === "desktop" ? <DesktopUpload /> : <MobileUpload />;
  if (step === STEPS.CONFIRM) return <DesktopConfirm />;
  if (step === STEPS.WAITING_CONSENT) return <DesktopDone />;
  if (step === STEPS.DONE) return <DesktopDone />;
  return <DesktopCoordonnees />;
}

const Step = ({ young: { inscriptionStep2023: eligibleStep } }) => {
  const device = useDevice();
  const { step } = useParams();

  const requestedStep = getStepFromUrlParam(step, STEP_LIST);

  if (!requestedStep && eligibleStep) {
    return <Redirect to={`/inscription2023/${getStepUrl(eligibleStep, STEP_LIST)}`} />;
  }

  const currentStep = requestedStep || STEP_LIST[0].name;

  const eligibleStepDetails = STEP_LIST.find((element) => element.name === eligibleStep);
  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === eligibleStep);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);

  const updatedEligibleStepIndex = eligibleStepDetails.allowNext ? eligibleStepIndex + 1 : eligibleStepIndex;

  if (currentStepIndex > updatedEligibleStepIndex) {
    return <Redirect to={`/inscription2023/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return renderStep(currentStep, device);
};

function renderStepCorrection(step, device) {
  if (step === CORRECTION_STEPS.ELIGIBILITE) return device === "desktop" ? <DesktopCorrectionEligibilite /> : <MobileCorrectionEligibilite />;
  if (step === CORRECTION_STEPS.PROFIL) return device === "desktop" ? <DesktopCorrectionProfil /> : <MobileCorrectionProfil />;
  // On peut réutiliser les composants si on veut pas dupliquer le code
  if (step === CORRECTION_STEPS.COORDONNEES) return <DesktopCoordonnees />;
  if (step === CORRECTION_STEPS.REPRESENTANTS) return <DesktopRepresentants />;
  if (step === CORRECTION_STEPS.DOCUMENTS) return <DesktopDocuments />;
  if (step === CORRECTION_STEPS.UPLOAD) return device === "desktop" ? <DesktopUpload /> : <MobileUpload />;
  return false;
}

const StepCorrection = () => {
  const device = useDevice();
  const { step } = useParams();

  if (renderStepCorrection(getStepFromUrlParam(step, CORRECTION_STEPS_LIST), device) === false) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  return renderStepCorrection(getStepFromUrlParam(step, CORRECTION_STEPS_LIST), device);
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (!young) return <Redirect to="/preinscription" />;

  //il n'a pas acces a l'inscription
  if (young?.status && ![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.WAITING_CORRECTION].includes(young?.status)) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  //Il a fini son inscription
  if (young.inscriptionStep2023 === "DONE" && young.status === "WAITING_VALIDATION") {
    return <Redirect to={{ pathname: "/" }} />;
  }

  //si la periode de modification est finie
  if (!inscriptionModificationOpenForYoungs(young.cohort)) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  if (young?.status === YOUNG_STATUS.WAITING_CORRECTION) {
    return <SentryRoute path="/inscription2023/correction/:step?/:category?" component={() => <StepCorrection young={young} />} />;
  }

  return <SentryRoute path="/inscription2023/:step?/:category?" component={() => <Step young={young} />} />;
}
