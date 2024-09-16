import React from "react";
import { useParams } from "react-router-dom";
import { getStepFromUrlParam, PREINSCRIPTION_STEPS, PREINSCRIPTION_STEPS_LIST, REINSCRIPTION_STEPS_LIST } from "../../../utils/navigation";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";

const STEPS = [
  {
    id: PREINSCRIPTION_STEPS.ELIGIBILITE,
    title: "Avant d'aller plus loin",
    parcours: ["preinscription", "reinscription"],
  },
  {
    id: PREINSCRIPTION_STEPS.SEJOUR,
    title: "Séjour de cohésion",
    parcours: ["preinscription", "reinscription"],
  },
  {
    id: PREINSCRIPTION_STEPS.PROFIL,
    title: "Mon compte volontaire SNU",
    parcours: ["preinscription"],
  },
];

const ProgressBar = ({ isReinscription = false }) => {
  const STEPS_LIST = isReinscription ? REINSCRIPTION_STEPS_LIST : PREINSCRIPTION_STEPS_LIST;

  let { step } = useParams();
  if (!step) {
    step = "eligibilite";
  }
  const currentStep = getStepFromUrlParam(step, STEPS_LIST);
  const parcours = isReinscription ? "reinscription" : "preinscription";
  const filteredSteps = STEPS.filter((e) => e.parcours.includes(parcours));
  const currentStepIndex = filteredSteps.findIndex((e) => e.id === currentStep);
  const currentStepTitle = filteredSteps[currentStepIndex]?.title;
  const nextStepTitle = filteredSteps[currentStepIndex + 1]?.title || "";

  return (
    <div className="p-2 md:p-0">
      <Stepper stepCount={filteredSteps.length} currentStep={currentStepIndex + 1} title={currentStepTitle} nextTitle={nextStepTitle} style={{ margin: 0 }} />
    </div>
  );
};

export default ProgressBar;
