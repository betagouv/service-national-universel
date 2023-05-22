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
    <section className={`order-3 mx-[1rem] my-[2rem] flex flex-col md:mx-[4rem] ${isStepMedicalFieldDone(young) ? "order-4" : "order-3"}`}>
      <article className="mb-3">
        <div className="flex flex-row items-center md:hidden">
          {nbvalid !== 4 && (
            <div className="mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white md:hidden" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7 md:text-base md:font-normal">{isStepMedicalFieldDone(young) ? "Bravo, vous avez fini !" : "4 étapes pour continuer"}</h1>
            <p className="text-sm leading-5 text-gray-500">{nbvalid} de 4 tâches réalisées</p>
          </div>
        </div>
        <div className="hidden md:flex">
          {nbvalid !== 4 && (
            <div className="mr-6 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7">{isStepMedicalFieldDone(young) ? "Bravo, vous avez fini !" : "4 étapes pour continuer"}</h1>
            <p className="text-sm leading-5 text-gray-500">{nbvalid} de 4 tâches réalisées</p>
          </div>
        </div>
      </article>
      <hr className="-mx-20 hidden text-gray-200 md:flex" />
      <div className="flex flex-col ">
        <StepPDR young={young} center={center} />
      </div>
      <hr className="-mx-20 hidden text-gray-200 md:flex" />
      <div className="flex flex-col ">
        <StepAgreement young={young} />
      </div>
      <hr className="-mx-20 hidden text-gray-200 md:flex" />
      <div className="flex flex-col ">
        <StepConvocation young={young} />
      </div>
      <hr className="-mx-20 hidden text-gray-200 md:flex" />
      <div className="flex flex-col ">
        <StepMedicalField young={young} />
      </div>
      <hr className="-mx-20 hidden text-gray-200 md:flex" />
    </section>
  );
}
