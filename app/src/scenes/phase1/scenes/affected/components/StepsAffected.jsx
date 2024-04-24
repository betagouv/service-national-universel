import React from "react";
import { HiBell } from "react-icons/hi";
import { useSelector } from "react-redux";
import StepAgreement from "./step/stepAgreement";
import StepConvocation from "./step/stepConvocation";
import StepMedicalFile from "./step/stepMedicalFile";
import StepPDR from "./step/StepPDR";
import { countOfStepsDone } from "../utils/steps.utils";

export default function StepsAffected({ affectationData }) {
  const young = useSelector((state) => state.Auth.young);
  if (!young) return <div />;

  const allDone = countOfStepsDone(young) === 4;

  return (
    <section className={`order-3 m-[1rem] flex flex-col md:mx-[4rem] ${allDone ? "order-4" : "order-3"}`}>
      <article className="mb-6">
        <div className="flex flex-row items-center md:hidden">
          {allDone && (
            <div className="mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white md:hidden" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7 md:text-base md:font-normal">{allDone ? "Bravo, vous avez fini !" : "4 étapes pour continuer"}</h1>
            <p className="text-sm leading-5 text-gray-500">{countOfStepsDone(young)} sur 4 tâches réalisées</p>
          </div>
        </div>

        <div className="hidden md:flex">
          {allDone && (
            <div className="mr-6 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7">{allDone ? "Bravo, vous avez fini !" : "4 étapes pour continuer"}</h1>
            <p className="text-sm leading-5 text-gray-500">{countOfStepsDone(young)} sur 4 tâches réalisées</p>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-4">
        <StepPDR affectationData={affectationData} />
        <StepAgreement affectationData={affectationData} />
        <StepConvocation affectationData={affectationData} />
        <StepMedicalFile />
      </div>
    </section>
  );
}
