import React from "react";
import { StepCard } from "../StepCard";
import { STEPS, useSteps } from "../../utils/steps.utils";

// La confirmation de participation ne s'enregistre plus depuis l'espace volontaire : cette étape affiche l'état existant.
export default function StepAgreement() {
  const { isStepDone } = useSteps();
  const index = 2;
  const isDone = isStepDone(STEPS.AGREEMENT);

  if (isDone) {
    return (
      <StepCard variant="done" index={index}>
        <div className="text-sm">
          <p className="font-semibold">Confirmez votre participation au séjour</p>
          <p className="mt-[0.75rem] md:mt-[0.25rem] text-gray-500">Votre participation au séjour est confirmée.</p>
        </div>
      </StepCard>
    );
  }

  return (
    <StepCard variant="disabled" index={index}>
      <div className="text-sm">
        <p className="font-semibold text-gray-500">Confirmez votre participation au séjour</p>
        <p className="mt-[0.75rem] md:mt-[0.25rem] text-gray-500">La confirmation de participation n'est plus disponible en ligne.</p>
      </div>
    </StepCard>
  );
}
