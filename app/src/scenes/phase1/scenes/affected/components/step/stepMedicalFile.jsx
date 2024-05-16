import React, { useState } from "react";
import MedicalFileModal from "../../../../components/MedicalFileModal";
import { StepCard } from "../StepCard";
import { useSelector } from "react-redux";
import { STEPS, isStepDone } from "../../utils/steps.utils";

export default function StepMedicalField({ data }) {
  const index = 4;
  const young = useSelector((state) => state.Auth.young);
  const isEnabled = isStepDone(STEPS.CONVOCATION, young);
  const isDone = isStepDone(STEPS.MEDICAL_FILE, young);
  const [open, setOpen] = useState(false);
  const email = data.session.sanitaryContactEmail;

  if (!isEnabled) {
    return (
      <StepCard variant="disabled" index={index}>
        <p className="font-medium text-gray-400">Téléchargez votre fiche sanitaire</p>
      </StepCard>
    );
  }

  if (email) {
    return (
      <StepCard variant={isDone ? "done" : ""} index={index}>
        <div className="flex items-center flex-col md:flex-row justify-between text-sm gap-4">
          <div>
            <p className="font-semibold">
              Transmettez votre fiche sanitaire
              <span className="text-xs bg-blue-100 text-blue-800 rounded w-fit px-1 md:ml-2 block md:inline">Obligatoire</span>
            </p>
            <p className="mt-1 text-gray-500">
              Envoyez votre fiche sanitaire et les documents annexes par e-mail à{" "}
              <a href={`mailto:${email}`} className="text-gray-500 underline underline-offset-2">
                {email}
              </a>
              .
            </p>
          </div>
          <button onClick={() => setOpen(true)} className="w-full md:w-48 text-sm text-white bg-blue-600 hover:bg-blue-800 p-2 rounded flex gap-2 justify-center">
            Commencer
          </button>
        </div>
        <MedicalFileModal title="Comment transmettre ma fiche sanitaire ?" isOpen={open} onClose={() => setOpen(false)} email={email} />
      </StepCard>
    );
  }

  return (
    <StepCard variant={isDone ? "done" : ""} index={index}>
      <div className="flex items-center flex-col md:flex-row justify-between text-sm">
        <div>
          <p className="font-semibold">
            Téléchargez votre fiche sanitaire
            <span className="text-xs bg-blue-100 text-blue-800 rounded w-fit px-1 ml-2">Obligatoire</span>
          </p>
          <p className="mt-1 text-gray-500">Complétez votre fiche sanitaire et remettez là à votre arrivée au centre du séjour.</p>
        </div>
        <button onClick={() => setOpen(true)} className="w-64 text-sm border hover:bg-gray-100 text-gray-600 p-2 shadow-sm rounded flex gap-2 justify-center">
          Ouvrir le mode d'emploi
        </button>
      </div>
      <MedicalFileModal title="Comment transmettre ma fiche sanitaire ?" isOpen={open} onClose={() => setOpen(false)} email={data.session.sanitaryContactEmail} />
    </StepCard>
  );
}
