import React, { useState } from "react";
import { useSelector } from "react-redux";
import { isStepAgreementDone, isStepPDRDone } from "../../utils/steps.utils";
import { StepCard } from "../StepCard";
import { AgreementModal } from "../modals/AgreementModal";

export default function StepAgreement({ departureDate, returnDate }) {
  const young = useSelector((state) => state.Auth.young);
  const [isOpen, setIsOpen] = useState(false);

  if (!isStepPDRDone(young)) {
    return (
      <StepCard state="disabled" stepNumber={2}>
        <p className="font-medium text-gray-400">Confirmez votre participation au séjour</p>
      </StepCard>
    );
  }

  if (isStepAgreementDone(young)) {
    return (
      <StepCard state="done" stepNumber={2}>
        <div className="flex items-center flex-col md:flex-row gap-3 justify-between text-sm">
          <div>
            <p className="font-semibold">Confirmez de votre participation au séjour</p>
            <p className="mt-[0.75rem] md:mt-[0.25rem] text-gray-500">Vous devez confirmer votre participation au séjour avant votre départ.</p>
          </div>
          <div className="w-full md:w-auto mt-1 md:mt-0">
            <button onClick={() => setIsOpen(true)} className="w-full text-sm border hover:bg-gray-100 py-2 px-4 shadow-sm rounded">
              Modifier
            </button>
          </div>
        </div>
        <AgreementModal isOpen={isOpen} setIsOpen={setIsOpen} departureDate={departureDate} returnDate={returnDate} />
      </StepCard>
    );
  }

  return (
    <StepCard state="todo" stepNumber={2}>
      <div className="flex items-center flex-col md:flex-row gap-3 justify-between text-sm">
        <div>
          <p className="font-semibold text-gray-800">Confirmez votre participation au séjour</p>
          <p className="mt-[0.75rem] md:mt-[0.25rem] text-gray-500">Vous devez confirmer votre participation au séjour avant votre départ.</p>
        </div>
        <div className="w-full md:w-auto mt-1 md:mt-0">
          <button onClick={() => setIsOpen(true)} className="w-full text-sm text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">
            Commencer
          </button>
        </div>
      </div>
      <AgreementModal isOpen={isOpen} setIsOpen={setIsOpen} departureDate={departureDate} returnDate={returnDate} />
    </StepCard>
  );
}
