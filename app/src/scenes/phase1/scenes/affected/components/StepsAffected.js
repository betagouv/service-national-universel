import React from "react";
import { HiBell } from "react-icons/hi";
import { useSelector } from "react-redux";
import { isStepMedicalFieldDone, numberOfStepsCompleted } from "../utils/steps.utils.js";
import StepAgreement from "./step/stepAgreement.js";
import StepConvocation from "./step/stepConvocation.js";
import StepMedicalField from "./step/stepMedicalFile.js";
import StepPDR from "./step/StepPDR";

export default function StepsAffected({ center }) {
  const young = useSelector((state) => state.Auth.young);
  if (!young) return null;
  const nbvalid = numberOfStepsCompleted(young);

  return (
    <section className={`flex flex-col mx-[1rem] md:mx-[4rem] my-[2rem] order-3 ${isStepMedicalFieldDone(young) ? "order-4" : "order-3"}`}>
      <article className="mb-3">
        <div className="flex md:hidden flex-row items-center">
          {nbvalid !== 4 && (
            <div className="flex items-center justify-center bg-orange-500 h-11 w-11 rounded-full mr-3">
              <HiBell className="flex md:hidden w-5 h-5 text-white rounded-full" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-base font-bold md:font-normal leading-7">{isStepMedicalFieldDone(young) ? "Bravo, vous avez fini !" : "4 étapes pour continuer"}</h1>
            <p className="text-sm text-gray-500 leading-5">{nbvalid} de 4 tâches réalisées</p>
          </div>
        </div>
        <div className="hidden md:flex">
          {nbvalid !== 4 && (
            <div className="flex items-center justify-center bg-orange-500 h-9 w-9 rounded-full mr-6">
              <HiBell className="flex w-5 h-5 text-white rounded-full" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7">{isStepMedicalFieldDone(young) ? "Bravo, vous avez fini !" : "4 étapes pour continuer"}</h1>
            <p className="text-sm text-gray-500 leading-5">{nbvalid} de 4 tâches réalisées</p>
          </div>
        </div>
      </article>
      <hr className="hidden md:flex text-gray-200 -mx-20" />
      <div className="flex flex-col ">
        <StepPDR young={young} center={center} />
      </div>
      <hr className="hidden md:flex text-gray-200 -mx-20" />
      <div className="flex flex-col ">
        <StepAgreement young={young} />
      </div>
      <hr className="hidden md:flex text-gray-200 -mx-20" />
      <div className="flex flex-col ">
        <StepConvocation young={young} />
      </div>
      <hr className="hidden md:flex text-gray-200 -mx-20" />
      <div className="flex flex-col ">
        <StepMedicalField young={young} />
      </div>
      <hr className="hidden md:flex text-gray-200 -mx-20" />
    </section>
  );
}
