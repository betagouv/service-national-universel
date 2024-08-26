import React, { useState } from "react";
import api from "../../../../../../services/api";
import MedicalFileModal from "../../../../components/MedicalFileModal";
import { StepCard } from "../StepCard";
import { setYoung } from "@/redux/auth/actions";
import { useDispatch, useSelector } from "react-redux";
import { STEPS, isStepDone } from "../../utils/steps.utils";
import { capture } from "@/sentry";

export default function StepMedicalField({ data }) {
  const index = 4;
  const young = useSelector((state) => state.Auth.young);
  const isEnabled = isStepDone(STEPS.CONVOCATION, young);
  const isDone = isStepDone(STEPS.MEDICAL_FILE, young);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const email = data.session.sanitaryContactEmail;

  async function onClick() {
    if (young?.cohesionStayMedicalFileDownload === "true") return;
    try {
      const { ok, data, code } = await api.put("/young/phase1/cohesionStayMedical", { cohesionStayMedicalFileDownload: "true" });
      if (!ok) throw new Error(code);
      dispatch(setYoung(data));
    } catch (e) {
      capture(e);
    }
  }

  if (!isEnabled) {
    return (
      <StepCard variant="disabled" index={index}>
        <p className="font-medium text-gray-400">Téléchargez votre fiche sanitaire</p>
      </StepCard>
    );
  }

  return (
    <StepCard variant={isDone ? "done" : ""} index={index}>
      {email ? (
        <div className="flex items-center flex-col md:flex-row justify-between text-sm gap-4">
          <div>
            <p className="font-semibold">
              Transmettez votre fiche sanitaire
              <span className="text-xs bg-blue-100 text-blue-800 rounded w-fit px-1 mt-2 md:ml-2 block md:inline">Obligatoire</span>
            </p>
            <p className="mt-2 text-gray-500">
              Envoyez votre fiche sanitaire et les documents annexes par e-mail à{" "}
              <a href={`mailto:${email}`}>
                <span className="inline-block text-gray-500 underline underline-offset-2">{email}</span>
              </a>
              puis remettez-les en mains propres le jour de votre arrivée au séjour.
            </p>
          </div>
          {isDone ? (
            <button onClick={() => setOpen(true)} className="w-full md:w-48 text-sm p-2 rounded flex gap-2 justify-center text-gray-600 hover:bg-gray-100 border shadow-sm">
              Ouvrir le mode d'emploi
            </button>
          ) : (
            <button onClick={() => setOpen(true)} className="w-full md:w-48 text-sm p-2 rounded flex gap-2 justify-center text-white bg-blue-600 hover:bg-blue-800">
              Commencer
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center flex-col md:flex-row justify-between text-sm gap-4">
          <div>
            <p className="font-semibold">
              Téléchargez votre fiche sanitaire
              <span className="text-xs bg-blue-100 text-blue-800 rounded w-fit px-1 mt-2 md:ml-2 block md:inline">Obligatoire</span>
            </p>
            <p className="mt-2 text-gray-500">Complétez votre fiche sanitaire et remettez là à votre arrivée au centre du séjour.</p>
          </div>
          <button onClick={() => setOpen(true)} className="w-full md:w-48 text-sm p-2 rounded flex gap-2 justify-center text-gray-600 hover:bg-gray-100 border shadow-sm">
            Ouvrir le mode d'emploi
          </button>
        </div>
      )}
      <MedicalFileModal title="Comment transmettre ma fiche sanitaire ?" isOpen={open} onClose={() => setOpen(false)} onClick={onClick} email={email} />
    </StepCard>
  );
}
