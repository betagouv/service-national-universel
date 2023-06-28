import React from "react";
import { HiBell } from "react-icons/hi";
import { useSelector } from "react-redux";
import { isStepMedicalFieldDone, numberOfStepsCompleted } from "../utils/steps.utils";
import StepAgreement from "./step/stepAgreement";
import StepConvocation from "./step/stepConvocation";
import StepMedicalField from "./step/stepMedicalFile";
import StepPDR from "./step/StepPDR";

export default function StepsAffected({ center, session, meetingPoint, departureDate, returnDate }) {
  const young = useSelector((state) => state.Auth.young);
  const nbvalid = numberOfStepsCompleted(young);

  return (
    <section className={`order-3 flex flex-col md:mx-[4rem] ${isStepMedicalFieldDone(young) ? "order-4" : "order-3"}`}>
      <article className="mx-6 my-10">
        <div className="flex">
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

      <div className="space-y-6">
        <StepPDR center={center} session={session} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />
        <StepAgreement departureDate={departureDate} returnDate={returnDate} />
        <StepConvocation center={center} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />
        <StepMedicalField young={young} />
      </div>
    </section>
  );
}
