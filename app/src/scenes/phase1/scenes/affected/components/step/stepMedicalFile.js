import React, { useEffect, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineDownload, HiOutlineMail } from "react-icons/hi";
import { useDispatch } from "react-redux";
import WithTooltip from "../../../../../../components/WithTooltip";
import { setYoung } from "../../../../../../redux/auth/actions";
import api from "../../../../../../services/api";
import { SENDINBLUE_TEMPLATES } from "../../../../../../utils";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "../../../../../../services/plausible";
import { CDN_BASE_URL } from "../../../../../representants-legaux/commons";
import MedicalFileModal from "../../../../components/MedicalFileModal";
import ConfirmationModal from "../../../../../../components/ui/modals/ConfirmationModal";
import useDevice from "../../../../../../hooks/useDevice";
import ButtonLink from "../../../../../../components/ui/buttons/ButtonLink";

export default function StepMedicalField({ young }) {
  const device = useDevice();

  const [valid, setValid] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [isSendEmailConfirmationModalOpen, setSendEmailConfirmationModalOpen] = useState(false);
  const [isMedicalFileModalOpen, setMedicalFileModalOpen] = useState(false);

  useEffect(() => {
    if (young) {
      setEnabled(young.convocationFileDownload === "true" || young.cohesionStayMedicalFileDownload === "true");
      setValid(young.cohesionStayMedicalFileDownload === "true");
    }
  }, [young]);

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
      {/* Desktop */}
      <div className="hidden md:flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-row py-4 items-center">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full mr-4 border-[1px] border-gray-200 text-gray-700">4</div>
          )}
          <div className="flex flex-1 flex-col mx-3">
            <h1 className={`text-base leading-7 ${enabled ? "text-gray-900" : "text-gray-400"}`}>Téléchargez votre fiche sanitaire</h1>
            <p className={`text-sm leading-5 ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Si vous ne l’avez pas déjà fait, vous devez renseigner votre fiche sanitaire et la remettre à votre arrivée au centre de séjour.
            </p>
          </div>
        </div>
        {/* Button */}
        {enabled ? (
          <>
            <div className="flex flex-row items-center justify-center pb-4 lg:!pb-0">
              <ButtonLink onClick={() => setMedicalFileModalOpen(true)} className="pl-4 pr-8">
                Voir le mode d’emploi
              </ButtonLink>
              <button
                className="flex items-center justify-center bg-gray-100 h-8 w-8 rounded-full mr-4 cursor-pointer hover:scale-110"
                onClick={() => setSendEmailConfirmationModalOpen(true)}>
                <WithTooltip tooltipText="Recevoir par email">
                  <HiOutlineMail className="h-5 w-5 text-gray-600" />
                </WithTooltip>
              </button>
              <a target="blank" href={CDN_BASE_URL + "/file/fiche-sanitaire-2023.pdf"} onClick={handleDownload}>
                <button
                  type="button"
                  className={`flex flex-row items-center justify-center px-4 py-2 rounded-lg ${
                    valid ? "border-[1px] border-blue-700 " : "bg-blue-600"
                  } cursor-pointer hover:scale-105`}>
                  <HiOutlineDownload className={`h-5 w-5 ${valid ? "text-blue-700" : "text-blue-300"} mr-2`} />
                  <span className={`${valid ? "text-blue-700" : "text-white"}`}>Télécharger</span>
                </button>
              </a>
            </div>
          </>
        ) : null}
      </div>
      {/* Mobile */}
      <div
        className={`md:hidden flex items-center border-[1px] mb-3 ml-4 rounded-xl h-36 cursor-pointer ${valid ? "border-green-500 bg-green-50" : "bg-white"} `}
        onClick={() => setMedicalFileModalOpen(enabled ? !isMedicalFileModalOpen : false)}>
        <div className="-translate-x-5 flex flex-row items-center w-full">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full border-[1px] bg-white border-gray-200 text-gray-700">4</div>
          )}
          <div className="flex flex-1 flex-col ml-3">
            <div className={`text-sm ${valid && "text-green-600"} ${enabled ? "text-gray-900" : "text-gray-400"}`}>Téléchargez votre fiche sanitaire</div>
            <div className={` text-sm leading-5 ${valid && "text-green-600 opacity-70"} ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Vous devez renseigner votre fiche sanitaire et la remettre à votre arrivée au centre de séjour.
            </div>
            {enabled ? <div className={` text-sm text-right leading-5 ${valid ? "text-green-500" : "text-blue-600"}`}>Télécharger</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
