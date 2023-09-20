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

import DesktopCorrectionEligibilite from "./desktop/correction/stepEligibilite";
import DesktopCorrectionProfil from "./desktop/correction/stepProfil";

import MobileCorrectionEligibilite from "./mobile/correction/stepEligibilite";
import MobileCorrectionProfil from "./mobile/correction/stepProfil";

import useDevice from "../../hooks/useDevice";

import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { getStepFromUrlParam, getStepUrl, CORRECTION_STEPS, CORRECTION_STEPS_LIST, INSCRIPTION_STEPS as STEPS, INSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import { YOUNG_STATUS, inscriptionModificationOpenForYoungs } from "snu-lib";
import FutureCohort from "./FutureCohort";
import InscriptionClosed from "./InscriptionClosed";
import { environment } from "../../config";

function renderStep(step, device) {
  if (step === STEPS.COORDONNEES) return device === "desktop" ? <DesktopCoordonnees /> : <MobileCoordonnees />;
  if (step === STEPS.REPRESENTANTS) return device === "desktop" ? <DesktopRepresentants /> : <MobileRepresentants />;
  if (step === STEPS.CONSENTEMENTS) return device === "desktop" ? <DesktopConsentements /> : <MobileConsentements />;
  if (step === STEPS.DOCUMENTS) return device === "desktop" ? <DesktopDocuments /> : <MobileDocuments />;
  if (step === STEPS.UPLOAD) return device === "desktop" ? <DesktopUpload /> : <MobileUpload />;
  if (step === STEPS.CONFIRM) return device === "desktop" ? <DesktopConfirm /> : <MobileConfirm />;
  if (step === STEPS.WAITING_CONSENT) return device === "desktop" ? <DesktopDone /> : <MobileDone />;
  if (step === STEPS.DONE) return device === "desktop" ? <DesktopDone /> : <MobileDone />;
  return device === "desktop" ? <DesktopCoordonnees /> : <MobileCoordonnees />;
}

const Step = ({ young: { inscriptionStep2023 } }) => {
  const device = useDevice();
  const { step } = useParams();

  const requestedStep = getStepFromUrlParam(step, STEP_LIST);

  const eligibleStep = inscriptionStep2023 || STEPS.COORDONNEES;

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

  return <DSFRLayout title="Inscription du volontaire">{renderStep(currentStep, device)}</DSFRLayout>;
};

function renderStepCorrection(step, device) {
  if (step === CORRECTION_STEPS.ELIGIBILITE) return device === "desktop" ? <DesktopCorrectionEligibilite /> : <MobileCorrectionEligibilite />;
  if (step === CORRECTION_STEPS.PROFIL) return device === "desktop" ? <DesktopCorrectionProfil /> : <MobileCorrectionProfil />;
  // On peut réutiliser les composants si on veut pas duppliquer le code
  if (step === CORRECTION_STEPS.COORDONNEES) return device === "desktop" ? <DesktopCoordonnees /> : <MobileCoordonnees />;
  if (step === CORRECTION_STEPS.REPRESENTANTS) return device === "desktop" ? <DesktopRepresentants /> : <MobileRepresentants />;
  if (step === CORRECTION_STEPS.DOCUMENTS) return device === "desktop" ? <DesktopDocuments /> : <MobileDocuments />;
  if (step === CORRECTION_STEPS.UPLOAD) return device === "desktop" ? <DesktopUpload /> : <MobileUpload />;
  return false;
}

const StepCorrection = () => {
  const device = useDevice();
  const { step } = useParams();

  if (renderStepCorrection(getStepFromUrlParam(step, CORRECTION_STEPS_LIST), device) === false) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  return <DSFRLayout title="Inscription du volontaire">{renderStepCorrection(getStepFromUrlParam(step, CORRECTION_STEPS_LIST), device)}</DSFRLayout>;
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);

  if (!young) return <Redirect to="/preinscription" />;

  if ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status) && young.cohort === "à venir" && environment === "production") {
    return <FutureCohort />;
  }

  //il n'a pas acces a l'inscription
  if (young?.status && ![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.WAITING_CORRECTION].includes(young?.status)) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  //Il a fini son inscription
  if (young.inscriptionStep2023 === "DONE" && young.status === "WAITING_VALIDATION") {
    return <Redirect to={{ pathname: "/" }} />;
  }

  // Si la periode de modification est finie, pour les volontaires en cours d'inscription qui n'ont pas encore été basculés sur "à venir"
  if (!inscriptionModificationOpenForYoungs(young.cohort, young, environment) && young.status === YOUNG_STATUS.IN_PROGRESS) {
    return <InscriptionClosed />;
  }

  //si la periode de modification est finie
  if (!inscriptionModificationOpenForYoungs(young.cohort, young, environment) && young.status !== YOUNG_STATUS.NOT_AUTORISED) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  if (young?.status === YOUNG_STATUS.WAITING_CORRECTION) {
    return <SentryRoute path="/inscription2023/correction/:step?/:category?" component={() => <StepCorrection young={young} />} />;
  }

  return <SentryRoute path="/inscription2023/:step?/:category?" component={() => <Step young={young} />} />;
}
