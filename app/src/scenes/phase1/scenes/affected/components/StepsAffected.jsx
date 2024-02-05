import React, { cloneElement } from "react";
import { HiBell } from "react-icons/hi";
import { useSelector } from "react-redux";
import StepAgreement from "./step/stepAgreement";
import StepConvocation from "./step/stepConvocation";
import StepMedicalFile from "./step/stepMedicalFile";
import StepPDR from "./step/StepPDR";
import { YOUNG_SOURCE } from "snu-lib";

export default function StepsAffected({ center, session, meetingPoint, departureDate, returnDate }) {
  const young = useSelector((state) => state.Auth.young);
  if (!young) return null;

  let steps = [
    {
      id: "PDR",
      component: <StepPDR center={center} session={session} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />,
      isDone: !!young?.meetingPointId || young?.deplacementPhase1Autonomous === "true" || young?.transportInfoGivenByLocal === "true",
      parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
    },
    {
      id: "AGREEMENT",
      component: <StepAgreement departureDate={departureDate} returnDate={returnDate} />,
      isDone: young?.youngPhase1Agreement === "true",
      parcours: [YOUNG_SOURCE.VOLONTAIRE],
    },
    {
      id: "CONVOCATION",
      component: <StepConvocation center={center} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />,
      isDone: young?.convocationFileDownload === "true",
      parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
    },
    {
      id: "MEDICAL_FILE",
      component: <StepMedicalFile />,
      isDone: young?.cohesionStayMedicalFileDownload === "true",
      parcours: [YOUNG_SOURCE.CLE, YOUNG_SOURCE.VOLONTAIRE],
    },
  ];

  // Filter steps based on young source and add enabled field based on the previous step isDone attribute
  steps = steps.filter((s) => s.parcours.includes(young.source));
  steps = steps.map((s, i) => {
    const enabled = i === 0 || steps[i - 1].isDone;
    return { ...s, enabled, stepNumber: i + 1 };
  });

  const countOfStepsDone = steps.filter((s) => s.isDone).length;
  const areAllStepsDone = steps.every((s) => s.isDone);

  return (
    <section className={`order-3 m-[1rem] flex flex-col md:mx-[4rem] ${areAllStepsDone ? "order-4" : "order-3"}`}>
      <article className="mb-6">
        <div className="flex flex-row items-center md:hidden">
          {areAllStepsDone && (
            <div className="mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white md:hidden" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7 md:text-base md:font-normal">{areAllStepsDone ? "Bravo, vous avez fini !" : `${steps.length} étapes pour continuer`}</h1>
            <p className="text-sm leading-5 text-gray-500">
              {countOfStepsDone} sur {steps.length} tâches réalisées
            </p>
          </div>
        </div>

        <div className="hidden md:flex">
          {areAllStepsDone && (
            <div className="mr-6 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500">
              <HiBell className="flex h-5 w-5 rounded-full text-white" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-7">{areAllStepsDone ? "Bravo, vous avez fini !" : `${steps.length} étapes pour continuer`}</h1>
            <p className="text-sm leading-5 text-gray-500">
              {countOfStepsDone} sur {steps.length} tâches réalisées
            </p>
          </div>
        </div>
      </article>

      {/* Map over the steps and inject computed props into the component */}
      <div className="grid grid-cols-1 gap-4">
        {steps.map((step) =>
          cloneElement(step.component, {
            key: step.id,
            enabled: step.enabled,
            isDone: step.isDone,
            stepNumber: step.stepNumber,
            ...step.component.props,
          }),
        )}
      </div>
    </section>
  );
}
