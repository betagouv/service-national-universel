import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../../../../redux/auth/actions";
import api from "../../../../../../services/api";
import { SENDINBLUE_TEMPLATES } from "../../../../../../utils";
import { isStepConvocationDone, isStepMedicalFieldDone } from "../../utils/steps.utils";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "../../../../../../services/plausible";
import { CDN_BASE_URL } from "../../../../../representants-legaux/commons";
import useDevice from "../../../../../../hooks/useDevice";

import { BsCheck2 } from "react-icons/bs";
import ButtonLink from "../../../../../../components/ui/buttons/ButtonLink";
import ConfirmationModal from "../../../../../../components/ui/modals/ConfirmationModal";
import { HiOutlineDownload, HiOutlineMail } from "react-icons/hi";
import MedicalFileModal from "../../../../components/MedicalFileModal";
import WithTooltip from "../../../../../../components/WithTooltip";

export default function StepMedicalField({ young }) {
  const device = useDevice();
  const valid = isStepMedicalFieldDone(young);
  const enabled = isStepConvocationDone(young);
  const [isSendEmailConfirmationModalOpen, setSendEmailConfirmationModalOpen] = useState(false);
  const [isMedicalFileModalOpen, setMedicalFileModalOpen] = useState(false);

  const dispatch = useDispatch();

  const handleDownload = async () => {
    const { data } = await api.put(`/young/phase1/cohesionStayMedical`, { cohesionStayMedicalFileDownload: "true" });
    plausibleEvent("affecté_step4");
    dispatch(setYoung(data));
  };

  const handleMail = async () => {
    try {
      const { ok } = await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`, {
        object: `Fiche sanitaire à compléter`,
        message: "Vous trouverez téléchargeable ci-dessous la fiche sanitaire à compléter.",
        link: CDN_BASE_URL + "/file/fiche-sanitaire-2023.pdf" + "?utm_campaign=transactionnel+telecharger+docum&utm_source=notifauto&utm_medium=mail+410+telecharger",
      });
      if (ok) toastr.success(`Document envoyé à ${young.email}`, "");
      else toastr.error("Erreur lors de l'envoie du document", "");
    } catch (error) {
      toastr.error("Erreur lors de l'envoie du document", "");
    }
  };

  return (
    <>
      <MedicalFileModal
        title={device === "desktop" ? "Mode d’emploi de la fiche sanitaire" : "Téléchargez votre fiche sanitaire"}
        isOpen={isMedicalFileModalOpen}
        onClose={() => setMedicalFileModalOpen(false)}
      />
      <ConfirmationModal
        isOpen={isSendEmailConfirmationModalOpen}
        onCancel={() => setSendEmailConfirmationModalOpen(false)}
        onClose={() => setSendEmailConfirmationModalOpen(false)}
        onConfirm={handleMail}
        title="Envoie de document par mail"
        subTitle={`Vous allez recevoir le lien de téléchargement de la fiche sanitaire par mail à l'adresse ${young.email}.`}
      />
      {/* Mobile */}
      <div
        className={`mb-3 ml-4 flex h-36 cursor-pointer items-center rounded-xl border-[1px] ${valid ? "border-green-500 bg-green-50" : "bg-white"} `}
        onClick={() => setMedicalFileModalOpen(enabled ? !isMedicalFileModalOpen : false)}>
        <div className="flex w-full -translate-x-5 flex-row items-center">
          {valid ? (
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
              <BsCheck2 className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-[1px] border-gray-200 bg-white text-gray-700">4</div>
          )}
          <div className="ml-3 flex flex-1 flex-col">
            <div className={`text-sm ${valid && "text-green-600"} ${enabled ? "text-gray-900" : "text-gray-400"}`}>Téléchargez votre fiche sanitaire</div>
            <div className={` text-sm leading-5 ${valid && "text-green-600 opacity-70"} ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Vous devez renseigner votre fiche sanitaire et la remettre à votre arrivée au centre de séjour.
            </div>
            {enabled ? <div className={` text-right text-sm leading-5 ${valid ? "text-green-500" : "text-blue-600"}`}>Télécharger</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
