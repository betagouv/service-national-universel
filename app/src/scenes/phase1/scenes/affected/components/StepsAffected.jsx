import React, { cloneElement } from "react";
import { HiBell } from "react-icons/hi";
import { useSelector } from "react-redux";
import StepAgreement from "./step/stepAgreement";
import StepConvocation from "./step/stepConvocation";
import StepMedicalFile from "./step/stepMedicalFile";
import StepPDR from "./step/StepPDR";

export default function StepsAffected({ steps, center, session, meetingPoint, departureDate, returnDate }) {
  const young = useSelector((state) => state.Auth.young);
  if (!young) return null;

  const total = steps.length;
  const count = steps.filter((s) => s.isDone).length;
  const allDone = count === total;

  const components = {
    PDR: <StepPDR center={center} session={session} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />,
    AGREEMENT: <StepAgreement departureDate={departureDate} returnDate={returnDate} />,
    CONVOCATION: <StepConvocation center={center} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />,
    MEDICAL_FILE: <StepMedicalFile />,
  };

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
            <h1 className="text-xl font-bold leading-7 md:text-base md:font-normal">{allDone ? "Bravo, vous avez fini !" : `${total} étapes pour continuer`}</h1>
            <p className="text-sm leading-5 text-gray-500">
              {count} sur {total} tâches réalisées
            </p>
          </div>
        </div>

        <div className="hidden md:flex">
          {allDone && (
            <div className="mr-6 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7">{allDone ? "Bravo, vous avez fini !" : `${total} étapes pour continuer`}</h1>
            <p className="text-sm leading-5 text-gray-500">
              {count} sur {total} tâches réalisées
            </p>
          </div>
        </div>
      </article>

      {/* Map over the steps and inject computed props into the component */}
      <div className="grid grid-cols-1 gap-4">
        {steps.map((step) =>
          cloneElement(components[step.id], {
            key: step.id,
            enabled: step.enabled,
            isDone: step.isDone,
            stepNumber: step.stepNumber,
            ...components[step.id].props,
          }),
        )}
      </div>
    </section>
  );
}
