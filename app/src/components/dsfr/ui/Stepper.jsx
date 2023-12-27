import React from "react";

function Stepper({ steps, stepValue }) {
  const totalSteps = steps.slice(-1)[0].stepNumber;
  const currentStep = steps.find((e) => e.value === stepValue);
  const nextStep = steps.find((e) => e.stepNumber === currentStep?.stepNumber + 1);

  if (!currentStep) return null;

  return (
    <div className="w-full md:w-[56rem] mx-auto px-[0.75rem] md:px-[6rem] bg-[#f9f6f2] text-[#161616] py-[1rem] md:py-[0rem] md:mt-8">
      <p className="text-sm">
        Étape {currentStep.stepNumber} sur {totalSteps}
      </p>
      <p className="mt-1 text-lg font-bold">{currentStep.label}</p>

      <div className="mt-2 flex w-full space-x-2 justify-between">
        {Array(totalSteps)
          .fill()
          .map((_, i) => (
            <div key={i} className={`h-2 w-1/${totalSteps} ${i < currentStep.stepNumber ? "bg-[#000091]" : "bg-[#C6C6FB]"}`} />
          ))}
      </div>
      {currentStep.stepNumber < totalSteps && (
        <div className="mt-2 hidden md:flex space-x-1 text-xs text-[#666666]">
          <p className="font-bold">Étape suivante :</p>
          <p>{nextStep.label}</p>
        </div>
      )}
    </div>
  );
}

export default Stepper;
