import React from "react";
import save from "../../../assets/save.svg";

function Stepper({ steps, stepValue, onSave }) {
  const totalSteps = steps.slice(-1)[0].stepNumber;
  const currentStep = steps.find((e) => e.value === stepValue);
  const nextStep = steps.find((e) => e.stepNumber === currentStep.stepNumber + 1);

  return (
    <div className="w-full bg-[#f9f6f2] px-3 text-[#161616] py-[1rem] md:pt-[2rem] md:pb-[0rem]">
      <div className="flex flex-col justify-center md:mx-auto md:my-0 md:w-1/2">
        <div className="flex justify-between">
          <div>
            <div className="text-sm">
              Étape {currentStep.stepNumber} sur {totalSteps}
            </div>
            <div className="mt-2 text-lg font-bold">{currentStep.label}</div>
          </div>
          {onSave && (
            <button onClick={onSave}>
              <img src={save} />
            </button>
          )}
        </div>

        <div className="mt-2 flex w-full space-x-2 justify-between">
          {Array(totalSteps)
            .fill()
            .map((_, i) => (
              <div key={i} className={`h-2 w-1/${totalSteps} ${i < currentStep.stepNumber ? "bg-[#000091]" : "bg-[#C6C6FB]"}`} />
            ))}
        </div>
        {currentStep.stepNumber < totalSteps && (
          <div className="mt-2 hidden md:flex space-x-1 text-xs text-[#666666]">
            <div className="font-bold">Étape suivante :</div>
            <div>{nextStep.label}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stepper;
