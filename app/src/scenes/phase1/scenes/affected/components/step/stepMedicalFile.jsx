import React, { useState } from "react";
import api from "../../../../../../services/api";
import { SENDINBLUE_TEMPLATES } from "../../../../../../utils";
import { isStepConvocationDone, isStepMedicalFieldDone } from "../../utils/steps.utils";
import { toastr } from "react-redux-toastr";
import { CDN_BASE_URL } from "../../../../../representants-legaux/commons";

import ConfirmationModal from "../../../../../../components/ui/modals/ConfirmationModal";
import MedicalFileModal from "../../../../components/MedicalFileModal";
import { StepCard } from "../StepCard";
import { HiEye, HiMail, HiOutlineDownload } from "react-icons/hi";
import { setYoung } from "@/redux/auth/actions";
import { useDispatch } from "react-redux";

export default function StepMedicalField({ young }) {
  const dispatch = useDispatch();
  const [isSendEmailConfirmationModalOpen, setSendEmailConfirmationModalOpen] = useState(false);
  const [isMedicalFileModalOpen, setMedicalFileModalOpen] = useState(false);

  const handleMail = async () => {
    try {
      const { ok } = await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`, {
        object: `Fiche sanitaire à compléter`,
        message: "Vous trouverez téléchargeable ci-dessous la fiche sanitaire à compléter.",
        link: CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf" + "?utm_campaign=transactionnel+telecharger+docum&utm_source=notifauto&utm_medium=mail+410+telecharger",
      });
      if (ok) toastr.success(`Document envoyé à ${young.email}`, "");
      else toastr.error("Erreur lors de l'envoi du document", "");
    } catch (error) {
      toastr.error("Erreur lors de l'envoi du document", "");
    }
  };

  const updateDocumentInformation = async () => {
    const { ok, data } = await api.put("/young/phase1/cohesionStayMedical", { cohesionStayMedicalFileDownload: "true" });
    if (ok) dispatch(setYoung(data));
  };

  if (!isStepConvocationDone(young)) {
    return (
      <StepCard state="disabled" stepNumber={4}>
        <p className="font-medium text-gray-400">Téléchargez votre fiche sanitaire</p>
      </StepCard>
    );
  }

  return (
    <StepCard state={isStepMedicalFieldDone(young) ? "done" : "todo"} stepNumber={4}>
      <div className="flex items-center flex-col md:flex-row gap-3 justify-between text-sm">
        <div>
          <p className="font-semibold">Téléchargez votre fiche sanitaire</p>
          <p className="mt-1 text-gray-500">Si vous ne l’avez pas déjà fait, vous devez renseigner votre fiche sanitaire et la remettre à votre arrivée au centre de séjour.</p>
        </div>
        <div className="w-full md:w-auto mt-1 md:mt-0 flex flex-col md:flex-row-reverse gap-2">
          <a
            href={CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf"}
            onClick={updateDocumentInformation}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full text-sm px-4 py-2 shadow-sm rounded flex gap-2 justify-center ${
              isStepConvocationDone(young) ? "border hover:bg-gray-100 text-gray-600" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}>
            <HiOutlineDownload className="h-5 w-5" />
            Télécharger
          </a>

          <button
            onClick={() => setSendEmailConfirmationModalOpen(true)}
            className="w-full text-sm border hover:bg-gray-100 text-gray-600 p-2 shadow-sm rounded flex gap-2 justify-center">
            <HiMail className="h-5 w-5" />
            <p className="md:hidden">Envoyer par mail</p>
          </button>

          <button onClick={() => setMedicalFileModalOpen(true)} className="w-full text-sm border hover:bg-gray-100 text-gray-600 p-2 shadow-sm rounded flex gap-2 justify-center">
            <HiEye className="h-5 w-5" />
            <p className="md:hidden">Afficher le mode d'emploi</p>
          </button>
        </div>
      </div>
      <MedicalFileModal title={"Mode d’emploi de la fiche sanitaire"} isOpen={isMedicalFileModalOpen} onClose={() => setMedicalFileModalOpen(false)} />
      <ConfirmationModal
        isOpen={isSendEmailConfirmationModalOpen}
        onCancel={() => setSendEmailConfirmationModalOpen(false)}
        onClose={() => setSendEmailConfirmationModalOpen(false)}
        onConfirm={handleMail}
        title="Envoi de document par mail"
        subTitle={`Vous allez recevoir le lien de téléchargement de la fiche sanitaire par mail à l'adresse ${young.email}.`}
      />
    </StepCard>
  );
}
