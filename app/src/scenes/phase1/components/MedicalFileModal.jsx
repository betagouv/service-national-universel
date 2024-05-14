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
          {email ? (
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
          ) : (
            <ul className="self-start">
              <li className="flex pl-2">
                <span className="mr-4 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-gray-200 pb-[2px] text-sm text-gray-700">1</span>
                <div className="mb-4 flex flex-col">
                  <div className="mb-1 text-sm font-bold text-gray-900">Télécharger la fiche sanitaire et la faire compléter</div>
                  <div className="text-[13px] text-gray-700">par l'un de vos représentant</div>
                  <div className="text-[13px] flex flex-col md:flex-row justify-between h-full text-gray-700 mt-2 space-y-2 md:space-y-0">
                    <a
                      href={CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf"}
                      onClick={updateDocumentInformation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm md:px-3 py-2 shadow-sm rounded flex gap-2 justify-center items-center border hover:bg-gray-100 text-gray-600 mr-2 md:mr-0`}>
                      <HiOutlineDownload className="h-5 w-5" />
                      Télécharger
                    </a>
                    <a
                      href={CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf"}
                      onClick={updateDocumentInformation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm px-3 py-2 shadow-sm rounded flex gap-2 justify-center items-center text-center border hover:bg-gray-100 text-gray-600 mr-2 md:mr-0`}>
                      <HiMail className="h-5 w-5" />
                      Recevoir par mail
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex pl-2">
                <span className="mr-4 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-gray-200 pb-[2px] text-sm text-gray-700">2</span>
                <div className="mb-4 flex flex-col">
                  <div className="mb-1 text-sm font-bold text-gray-900">Se munir des documents annexes</div>
                  <div className="text-[13px] text-gray-700">
                    mentionnés dans la fiche sanitaire (attestation de vaccination, attestation de sécurité sociale, documents éventuels...)
                  </div>
                  <div className="text-[13px] italic text-gray-600"></div>
                </div>
              </li>
              <li className="flex bg-blue-100 rounded-md pt-4 pl-2">
                <span className="mr-4 flex h-[34px] w-[34px] bg-white shrink-0 items-center justify-center rounded-full border border-gray-200 pb-[2px] text-sm text-gray-700">
                  3
                </span>
                <div className="mb-4 flex flex-col">
                  <div className="mb-1 text-sm font-bold text-gray-900">Envoyer l'ensemble des documents par e-mail</div>
                  <div className="text-[13px] text-gray-700">à {young.lastName} avant votre arrivé au séjour</div>
                  <div className="text-[13px] text-gray-700">
                    <ul className="mt-2 mr-2 py-2 border rounded-md">
                      <li className="flex bg-blue-100 flex items-center rounded-md pl-2">
                        <span className="mr-2 flex h-[6px] w-[6px] bg-gray-400 shrink-0 items-center justify-center rounded-full border border-gray-200 pb-[2px] text-sm text-gray-700"></span>
                        <p className="flex flex-col">Les pièces jointes doivent peser moins de 10 Mo. </p>
                      </li>
                      <li className="flex bg-blue-100 rounded-md pl-2">
                        <span className="mt-1.5 mr-2 flex h-[6px] w-[6px] bg-gray-400 shrink-0 items-center justify-center rounded-full border border-gray-200 pb-[2px] text-sm text-gray-700"></span>
                        <div className="flex flex-col">
                          Si vous n’arrivez pas à envoyer la fiche sanitaire et les documents annexes, vous pourrez les remettre au référent sanitaire en mains propres le jour de
                          votre arrivée au centre du séjour.{" "}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          )}
        </div>

        <ButtonPrimary className="mt-6 hidden w-full md:block" onClick={handleClick}>
          J'ai compris
        </ButtonPrimary>
      </div>
    </Modal>
  );
};

export default MedicalFileModal;
