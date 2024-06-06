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
import { supportURL } from "../../config";
import { getCohort } from "@/utils/cohorts";
import useAuth from "@/services/useAuth";
import Help from "./components/Help";
import Stepper from "@/components/dsfr/ui/Stepper";

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

const Step = ({ young: { hasStartedReinscription, reinscriptionStep2023, inscriptionStep2023 } }) => {
  const { step } = useParams();
  const { isCLE } = useAuth();
  const title = isCLE ? "Inscription de l'élève" : "Inscription du volontaire";
  const supportLink = `${supportURL}${isCLE ? "/base-de-connaissance/les-classes-engagees" : "/base-de-connaissance/phase-0-les-inscriptions"}`;
  const requestedStep = getStepFromUrlParam(step, STEP_LIST);

  const eligibleStep = hasStartedReinscription ? reinscriptionStep2023 : inscriptionStep2023 || STEPS.COORDONNEES;

  if (!requestedStep && eligibleStep) {
    return <Redirect to={`/inscription2023/${getStepUrl(eligibleStep, STEP_LIST)}`} />;
  }

  const currentStep = requestedStep || STEP_LIST[0].name;

  const eligibleStepDetails = STEP_LIST.find((element) => element.name === eligibleStep);
  const eligibleStepIndex = STEP_LIST.findIndex((element) => element.name === eligibleStep);
  const currentStepIndex = STEP_LIST.findIndex((element) => element.name === currentStep);

  const updatedEligibleStepIndex = eligibleStepDetails.allowNext ? eligibleStepIndex + 1 : eligibleStepIndex;

  let steps = [
    { value: STEPS.COORDONNEES, label: "Dites-nous en plus sur vous", stepNumber: 1 },
    { value: STEPS.CONSENTEMENTS, label: "Consentements", stepNumber: 2 },
    { value: STEPS.REPRESENTANTS, label: "Mes représentants légaux", stepNumber: 3 },
  ];

  if (!isCLE) {
    steps.push({ value: STEPS.DOCUMENTS, label: "Justifier de mon identité", stepNumber: 4 }, { value: STEPS.UPLOAD, label: "Justifier de mon identité", stepNumber: 4 });
  }

  if (currentStepIndex > updatedEligibleStepIndex) {
    return <Redirect to={`/inscription2023/${STEP_LIST[eligibleStepIndex].url}`} />;
  }

  return (
    <DSFRLayout title={title}>
      <Stepper steps={steps} stepValue={currentStep} />
      {renderStep(currentStep)}
      <Help supportLink={supportLink} />
    </DSFRLayout>
  );
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
  const { isCLE } = useAuth();
  const title = isCLE ? "Inscription de l'élève" : "Inscription du volontaire";
  if (renderStepCorrection(getStepFromUrlParam(step, CORRECTION_STEPS_LIST)) === false) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  return <DSFRLayout title={title}>{renderStepCorrection(getStepFromUrlParam(step, CORRECTION_STEPS_LIST))}</DSFRLayout>;
};

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const { isCLE } = useAuth();
  const cohort = getCohort(young.cohort);

  if (!young) return <Redirect to="/preinscription" />;

  if ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status) && young.cohort === "à venir") {
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
  if (young.inscriptionStep2023 === "DONE" && young.status === "WAITING_VALIDATION" && !young.hasStartedReinscription) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  //il a fini sa re-inscription
  if (young.reinscriptionStep2023 === "DONE" && young.status === "WAITING_VALIDATION" && young.hasStartedReinscription) {
    return <Redirect to={{ pathname: "/" }} />;
  }

  if (!inscriptionCreationOpenForYoungs(cohort) && [YOUNG_STATUS.IN_PROGRESS].includes(young.status)) {
    return <InscriptionClosed young={young} isCLE={isCLE} />;
  }

  //si la periode de modification est finie
  if (!inscriptionModificationOpenForYoungs(cohort) && young.status !== YOUNG_STATUS.NOT_AUTORISED) {
    return <InscriptionClosed young={young} isCLE={isCLE} />;
  }

  if (young?.status === YOUNG_STATUS.WAITING_CORRECTION) {
    return <SentryRoute path="/inscription2023/correction/:step?/:category?" component={() => <StepCorrection young={young} />} />;
  }

  return <SentryRoute path="/inscription2023/:step?/:category?" component={() => <Step young={young} />} />;
}
