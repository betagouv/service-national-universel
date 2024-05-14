import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import Modal from "../../../components/ui/modals/Modal";
import { SENDINBLUE_TEMPLATES } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import API from "../../../services/api";
import { CDN_BASE_URL } from "../../representants-legaux/commons";
import { HiOutlineDownload, HiMail, HiOutlineX } from "react-icons/hi";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonLinkLight from "@/components/ui/buttons/ButtonLinkLight";
import ButtonLight from "../../../components/ui/buttons/ButtonLight";
import EnumeratedList from "./EnumeratedList";
import ConfirmationModal from "../../../components/ui/modals/ConfirmationModal";

const MedicalFileModal = ({ isOpen, onClose, title = "Téléchargez votre fiche sanitaire", email = "" }) => {
  const [open, setOpen] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const handleClick = async () => {
    const { ok, data } = await API.put("/young/phase1/cohesionStayMedical", { cohesionStayMedicalFileDownload: "true" });
    if (ok) dispatch(setYoung(data));
    onClose;
  };

  const handleConfirm = async () => {
    try {
      const { ok } = await API.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`, {
        object: `Fiche sanitaire à compléter`,
        message: "Vous trouverez téléchargeable ci-dessous la fiche sanitaire à compléter.",
        link: CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf" + "?utm_campaign=transactionnel+telecharger+docum&utm_source=notifauto&utm_medium=mail+410+telecharger",
      });
      if (ok) toastr.success(`Document envoyé à ${young.email}`, "");
      else toastr.error("Erreur lors de l'envoie du document", "");
    } catch (error) {
      toastr.error("Erreur lors de l'envoie du document", "");
    } finally {
      setOpen(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full bg-white md:w-[512px]">
      <ConfirmationModal
        isOpen={open}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Envoi de document par mail"
        subTitle={`Vous allez recevoir le lien de téléchargement de la fiche sanitaire par mail à l'adresse ${young.email}.`}
      />
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:items-center">
          <HiOutlineX onClick={onClose} className="h-5 w-5 self-end md:hidden" />
          <h1 className="mb-2 font-medium text-gray-900 md:self-center md:text-xl">{title}</h1>
          <EnumeratedList
            className="self-start"
            items={[
              {
                title: "Télécharger la fiche sanitaire et la faire compléter",
                description: "par un de vos représentants légaux.",
                actions: (
                  <div className="flex gap-2 mt-2">
                    <ButtonLinkLight href={CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf"} target="_blank" rel="noreferrer">
                      <HiOutlineDownload className="mr-1 h-5 w-5 text-gray-500 flex-none" />
                      Télécharger
                    </ButtonLinkLight>
                    <ButtonLight onClick={() => setOpen(true)}>
                      <HiMail className="mr-1 h-5 w-5 text-gray-500 flex-none" />
                      Recevoir sur ma boîte mail
                    </ButtonLight>
                  </div>
                ),
              },
              {
                title: "Se munir des documents annexes",
                description: "mentionnés dans la fiche sanitaire (attestation de vaccination, attestation de sécurité sociale, documents éventuels...)",
              },
              {
                title: "Remettre l’ensemble des documents en mains propres",
                description: "à l’équipe d’encadrement à l’arrivée au séjour, dans une enveloppe portant la mention “À l’attention du référent sanitaire, Pli Confidentiel”",
                className: "bg-blue-50 rounded-lg",
              },
            ]}
          />
        </div>
        <ButtonPrimary className="mt-6 hidden w-full md:block" onClick={handleClick}>
          J'ai compris
        </ButtonPrimary>
      </div>
    </Modal>
  );
};

export default MedicalFileModal;
