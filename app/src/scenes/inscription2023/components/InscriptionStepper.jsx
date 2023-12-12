import React from "react";
import { useParams } from "react-router-dom";
import { getStepFromUrlParam, INSCRIPTION_STEPS, INSCRIPTION_STEPS_LIST } from "../../../utils/navigation";
import useAuth from "@/services/useAuth";
import { YOUNG_SOURCE } from "snu-lib";
import Stepper from "@/components/dsfr/ui/Stepper";

const InscriptionStepper = () => {
  const { young } = useAuth();
  const isCle = YOUNG_SOURCE.CLE === young?.source;

  const { step } = useParams();
  const verifiedStep = getStepFromUrlParam(step, INSCRIPTION_STEPS_LIST, true);

  let steps = [
    { value: INSCRIPTION_STEPS.COORDONNEES, label: "Dites-nous en plus sur vous", stepNumber: 1 },
    { value: INSCRIPTION_STEPS.CONSENTEMENTS, label: "Consentements", stepNumber: 2 },
    { value: INSCRIPTION_STEPS.REPRESENTANTS, label: "Mes représentants légaux", stepNumber: 3 },
  ];

  if (!isCle) {
    steps.push(
      { value: INSCRIPTION_STEPS.DOCUMENTS, label: "Justifier de mon identité", stepNumber: 4 },
      { value: INSCRIPTION_STEPS.UPLOAD, label: "Justifier de mon identité", stepNumber: 4 },
    );
  }

  return <Stepper steps={steps} stepValue={verifiedStep} />;
};

export default InscriptionStepper;
