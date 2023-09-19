import React from "react";
import { useSelector } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import StepConfirm from "./mobile/stepConfirm";
import StepConsentements from "./mobile/stepConsentements";
import StepCoordonnees from "./mobile/stepCoordonnees";
import StepDocuments from "./mobile/stepDocuments";
import StepDone from "./mobile/stepDone";
import StepRepresentants from "./mobile/stepRepresentants";
import StepUpload from "./mobile/stepUpload";

import MobileCorrectionEligibilite from "./mobile/correction/stepEligibilite";
import MobileCorrectionProfil from "./mobile/correction/stepProfil";

import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { getStepFromUrlParam, getStepUrl, CORRECTION_STEPS, CORRECTION_STEPS_LIST, INSCRIPTION_STEPS as STEPS, INSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import { YOUNG_STATUS, inscriptionModificationOpenForYoungs } from "snu-lib";
import FutureCohort from "./FutureCohort";
import { environment } from "../../config";

function renderStep(step) {
  if (step === STEPS.COORDONNEES) return <StepCoordonnees />;
  if (step === STEPS.REPRESENTANTS) return <StepRepresentants />;
  if (step === STEPS.CONSENTEMENTS) return <StepConsentements />;
  if (step === STEPS.DOCUMENTS) return <StepDocuments />;
  if (step === STEPS.UPLOAD) return <StepUpload />;
  if (step === STEPS.CONFIRM) return <StepConfirm />;
  if (step === STEPS.WAITING_CONSENT) return <StepDone />;
  if (step === STEPS.DONE) return <StepDone />;
  return <StepCoordonnees />;
}

const Step = ({ young: { inscriptionStep2023 } }) => {
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

  return <DSFRLayout title="Inscription du volontaire">{renderStep(currentStep)}</DSFRLayout>;
};

function renderStepCorrection(step) {
  if (step === CORRECTION_STEPS.ELIGIBILITE) return <MobileCorrectionEligibilite />;
  if (step === CORRECTION_STEPS.PROFIL) return <MobileCorrectionProfil />;
  if (step === CORRECTION_STEPS.COORDONNEES) return <StepCoordonnees />;
  if (step === CORRECTION_STEPS.REPRESENTANTS) return <StepRepresentants />;
  if (step === CORRECTION_STEPS.DOCUMENTS) return <StepDocuments />;
  if (step === CORRECTION_STEPS.UPLOAD) return <StepUpload />;
  return false;
}

const StepCorrection = () => {
  const { step } = useParams();

  if (renderStepCorrection(getStepFromUrlParam(step, CORRECTION_STEPS_LIST)) === false) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  return <DSFRLayout title="Inscription du volontaire">{renderStepCorrection(getStepFromUrlParam(step, CORRECTION_STEPS_LIST))}</DSFRLayout>;
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

  //si la periode de modification est finie
  if (!inscriptionModificationOpenForYoungs(young.cohort, young, environment) && young.status !== YOUNG_STATUS.NOT_AUTORISED) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  if (young?.status === YOUNG_STATUS.WAITING_CORRECTION) {
    return <SentryRoute path="/inscription2023/correction/:step?/:category?" component={() => <StepCorrection young={young} />} />;
  }

  return <SentryRoute path="/inscription2023/:step?/:category?" component={() => <Step young={young} />} />;
}
