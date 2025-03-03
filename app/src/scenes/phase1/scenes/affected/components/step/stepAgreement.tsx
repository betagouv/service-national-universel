import React, { useState } from "react";
import { StepCard } from "../StepCard";
import { AgreementModal } from "../modals/AgreementModal";
import { STEPS, useSteps } from "../../utils/steps.utils";

export default function StepAgreement() {
  const { isStepDone } = useSteps();
  const index = 2;
  const isEnabled = isStepDone(STEPS.PDR);
  const isDone = isStepDone(STEPS.AGREEMENT);
  const [isOpen, setIsOpen] = useState(false);

  if (!isEnabled) {
    return (
      <StepCard variant="disabled" index={index}>
        <p className="font-medium text-gray-400">Confirmez votre participation au séjour</p>
      </StepCard>
    );
  }

  if (isDone) {
    return (
      <StepCard variant="done" index={index}>
        <div className="flex items-center flex-col md:flex-row gap-3 justify-between text-sm">
          <div>
            <p className="font-semibold">Confirmez votre participation au séjour</p>
            <p className="mt-[0.75rem] md:mt-[0.25rem] text-gray-500">
              Vous devez confirmer votre participation au séjour <b>sous 3 jours</b> à partir de votre affectation. Passé ce délai, votre place sera proposée à un autre volontaire.
            </p>
          </div>
          <div className="w-full md:w-auto mt-1 md:mt-0">
            <button onClick={() => setIsOpen(true)} className="w-full text-sm border hover:bg-gray-100 py-2 px-4 shadow-sm rounded">
              Modifier
            </button>
          </div>
        </div>
        <AgreementModal isOpen={isOpen} setIsOpen={setIsOpen} />
      </StepCard>
    );
  }

  return (
    <StepCard index={index}>
      <div className="flex items-center flex-col md:flex-row gap-3 justify-between text-sm">
        <div>
          <p className="font-semibold text-gray-800">Confirmez votre participation au séjour</p>
          <p className="mt-[0.75rem] md:mt-[0.25rem] text-gray-500">
            Vous devez confirmer votre participation au séjour <b>sous 3 jours</b> à partir de votre affectation. Passé ce délai, votre place sera proposée à un autre volontaire.
          </p>
        </div>
        <div className="w-full md:w-auto mt-1 md:mt-0">
          <button onClick={() => setIsOpen(true)} className="w-full text-sm text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">
            Commencer
          </button>
        </div>
      </div>
      <AgreementModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </StepCard>
  );
}
