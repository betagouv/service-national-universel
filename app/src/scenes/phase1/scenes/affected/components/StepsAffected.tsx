import React from "react";
import { HiBell } from "react-icons/hi";
import { Link } from "react-router-dom";
import { RiInformationFill } from "react-icons/ri";
import StepAgreement from "./step/stepAgreement";
import StepConvocation from "./step/stepConvocation";
import StepMedicalFile from "./step/stepMedicalFile";
import StepPDR from "./step/StepPDR";
import { useSteps } from "../utils/steps.utils";
import useAuth from "@/services/useAuth";
import plausibleEvent from "@/services/plausible";
import Loader from "@/components/Loader";

export default function StepsAffected() {
  const { isCLE, young } = useAuth();
  const { areAllStepsDone, countOfStepsDone } = useSteps();
  if (!young) return <Loader />;

  function handleClick() {
    plausibleEvent("CLE affecte - desistement");
  }

  return (
    <section id="etapes" className="flex flex-col">
      <article className="mb-6">
        {isCLE && (
          <>
            <div className="bg-blue-50 rounded-xl xl:flex text-center text-sm p-3 mt-2 mb-8 gap-2">
              <div>
                <RiInformationFill className="text-xl text-blue-400 inline-block mr-2 align-bottom" />
                <span className="text-blue-800 font-semibold">Vous n’êtes plus disponible ?</span>
              </div>
              <Link
                to={{
                  pathname: "/changer-de-sejour/se-desister",
                  state: { backlink: "/phase1" },
                }}
                className="text-blue-600 underline underline-offset-2"
                onClick={handleClick}>
                {" "}
                Se désister du SNU.
              </Link>
            </div>
          </>
        )}
        <div className="flex flex-row items-center md:hidden">
          {areAllStepsDone && (
            <div className="mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white md:hidden" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7 md:text-base md:font-normal">{areAllStepsDone ? "Bravo, vous avez fini !" : "4 étapes pour continuer"}</h1>
            <p className="text-sm leading-5 text-gray-500">{countOfStepsDone} sur 4 tâches réalisées</p>
          </div>
        </div>

        <div className="hidden md:flex">
          {areAllStepsDone && (
            <div className="mr-6 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7">{areAllStepsDone ? "Bravo, vous avez fini !" : "4 étapes pour continuer"}</h1>
            <p className="text-sm leading-5 text-gray-500">{countOfStepsDone} sur 4 tâches réalisées</p>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-4">
        <StepPDR />
        <StepAgreement />
        <StepConvocation />
        <StepMedicalFile />
      </div>
    </section>
  );
}
