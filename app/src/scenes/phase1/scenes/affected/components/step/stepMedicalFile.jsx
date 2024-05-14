import React, { useState } from "react";
import api from "../../../../../../services/api";
import MedicalFileModal from "../../../../components/MedicalFileModal";
import { StepCard } from "../StepCard";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { setYoung } from "@/redux/auth/actions";
import { useDispatch, useSelector } from "react-redux";
import { STEPS, isStepDone } from "../../utils/steps.utils";

export default function StepMedicalField({ data }) {
  const index = 4;
  const young = useSelector((state) => state.Auth.young);
  const isEnabled = isStepDone(STEPS.CONVOCATION, young);
  const isDone = isStepDone(STEPS.MEDICAL_FILE, young);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const updateDocumentInformation = async () => {
    const { ok, data } = await api.put("/young/phase1/cohesionStayMedical", { cohesionStayMedicalFileDownload: "true" });
    if (ok) dispatch(setYoung(data));
  };

  if (!isEnabled) {
    return (
      <StepCard variant="disabled" index={index}>
        <p className="font-medium text-gray-400">Téléchargez votre fiche sanitaire</p>
      </StepCard>
    );
  }

  // if (data.session.sanitaryContactEmail) {
  //   return;
  // }

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
      <MedicalFileModal title="Comment transmettre ma fiche sanitaire ?" isOpen={open} onClose={() => setOpen(false)} />
    </StepCard>
  );
}
