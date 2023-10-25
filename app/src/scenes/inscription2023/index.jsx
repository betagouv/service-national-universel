import React from "react";
import { useSelector } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import StepConfirm from "./steps/stepConfirm";
import StepConsentements from "./steps/stepConsentements";
import StepCoordonnees from "./steps/stepCoordonnees";
import StepDocuments from "./steps/stepDocuments";
import StepDone from "./steps/stepDone";
import StepRepresentants from "./steps/stepRepresentants";
import StepUpload from "./steps/stepUpload";

import MobileCorrectionEligibilite from "./steps/correction/stepEligibilite";
import MobileCorrectionProfil from "./steps/correction/stepProfil";

import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { getStepFromUrlParam, getStepUrl, CORRECTION_STEPS, CORRECTION_STEPS_LIST, INSCRIPTION_STEPS as STEPS, INSCRIPTION_STEPS_LIST as STEP_LIST } from "../../utils/navigation";
import { YOUNG_STATUS, inscriptionCreationOpenForYoungs, inscriptionModificationOpenForYoungs } from "snu-lib";
import FutureCohort from "./FutureCohort";
import InscriptionClosed from "./InscriptionClosed";
import { environment } from "../../config";
import { getCohort } from "@/utils/cohorts";

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
  const cohort = getCohort(young.cohort);

  if (!young) return <Redirect to="/preinscription" />;

  if ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status) && young.cohort === "à venir" && environment === "production") {
    return <FutureCohort />;
  }

  //il n'a pas acces a l'inscription
  if (
    young?.status &&
    ![YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.REINSCRIPTION].includes(young?.status)
  ) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  //Il a fini son inscription
  if (young.inscriptionStep2023 === "DONE" && young.status === "WAITING_VALIDATION") {
    return <Redirect to={{ pathname: "/" }} />;
  }

  // Si la periode de modification est finie, pour les volontaires en cours d'inscription qui n'ont pas encore été basculés sur "à venir"
  if (!inscriptionCreationOpenForYoungs(cohort) && young.status === YOUNG_STATUS.IN_PROGRESS) {
    return <InscriptionClosed />;
  }

  //si la periode de modification est finie
  if (!inscriptionModificationOpenForYoungs(cohort) && young.status !== YOUNG_STATUS.NOT_AUTORISED) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  if (young?.status === YOUNG_STATUS.WAITING_CORRECTION) {
    return <SentryRoute path="/inscription2023/correction/:step?/:category?" component={() => <StepCorrection young={young} />} />;
  }

  return <SentryRoute path="/inscription2023/:step?/:category?" component={() => <Step young={young} />} />;
}
