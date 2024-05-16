import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import Modal from "../../../components/ui/modals/Modal";
import { SENDINBLUE_TEMPLATES } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import API from "../../../services/api";
import { CDN_BASE_URL } from "../../representants-legaux/commons";
import { HiOutlineDownload, HiMail } from "react-icons/hi";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonLinkLight from "@/components/ui/buttons/ButtonLinkLight";
import ButtonLight from "../../../components/ui/buttons/ButtonLight";
import ConfirmationModal from "../../../components/ui/modals/ConfirmationModal";

const MedicalFileModal = ({ isOpen, onClose, title = "Téléchargez votre fiche sanitaire", email }) => {
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
      else toastr.error("Erreur lors de l'envoi du document", "");
    } catch (error) {
      toastr.error("Erreur lors de l'envoi du document", "");
    } finally {
      setOpen(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full bg-white md:w-[512px] p-4">
      <ConfirmationModal
        isOpen={open}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Envoi de document par mail"
        subTitle={`Vous allez recevoir le lien de téléchargement de la fiche sanitaire par mail à l'adresse ${young.email}.`}
      />
      <h2 className="font-medium text-gray-900 text-xl text-center m-0">{title}</h2>
      <ul className="">
        <li className="flex px-2 py-4 gap-3">
          <div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-sm text-gray-700">1</span>
          </div>
          <div className="text-sm">
            <p className="font-bold text-gray-900">Télécharger la fiche sanitaire et la faire compléter</p>
            <p className="text-gray-700">par l'un de vos représentant</p>
            <div className="mt-2 flex flex-col md:flex-row gap-2 text-gray-700">
              <ButtonLinkLight href={CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf"} target="_blank" rel="noreferrer">
                <HiOutlineDownload className="mr-1 h-5 w-5 text-gray-500 flex-none" />
                Télécharger
              </ButtonLinkLight>
              <ButtonLight onClick={() => setOpen(true)}>
                <HiMail className="mr-1 h-5 w-5 text-gray-500 flex-none" />
                Recevoir sur ma boîte mail
              </ButtonLight>
            </div>
          </div>
        </li>

        <li className="flex px-2 py-4 gap-3">
          <div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-sm text-gray-700">2</span>
          </div>
          <div className="text-sm">
            <p className="font-bold text-gray-900">Se munir des documents annexes</p>
            <p className="text-gray-700">mentionnés dans la fiche sanitaire (attestation de vaccination, attestation de sécurité sociale, documents éventuels...)</p>
          </div>
        </li>

        <li className="flex bg-blue-50 rounded-xl px-3 py-4 gap-3">
          <div>
            <span className="flex h-8 w-8 bg-white shrink-0 items-center justify-center rounded-full border border-gray-200 text-sm text-gray-700">3</span>
          </div>
          {email ? (
            <div className="text-sm">
              <p className="font-bold text-gray-900">Envoyer l'ensemble des documents par e-mail</p>
              <p className="text-gray-700">
                à{" "}
                <a href={`mailto:${email}`} className="text-blue-600 underline underline-offset-2">
                  {email}
                </a>{" "}
                avant votre arrivé au séjour
              </p>
              <ul className="m-2 p-3 border rounded-xl list-disc list-inside">
                <li>Les pièces jointes doivent peser moins de 10 Mo.</li>
                <li>
                  Si vous n’arrivez pas à envoyer la fiche sanitaire et les documents annexes, vous pourrez les remettre au référent sanitaire en mains propres le jour de votre
                  arrivée au centre du séjour.
                </li>
              </ul>
            </div>
          ) : (
            <div className="text-sm">
              <p className="font-bold text-gray-900">Remettre l’ensemble des documents en mains propres</p>
              <p className="text-gray-700">
                à l’équipe d’encadrement à l’arrivée au séjour, dans une enveloppe portant la mention <i>“À l’attention du référent sanitaire, Pli Confidentiel”</i>.
              </p>
            </div>
          )}
        </li>
      </ul>

      <ButtonPrimary className="mt-6 w-full" onClick={handleClick}>
        J'ai compris
      </ButtonPrimary>
    </Modal>
  );
};

export default MedicalFileModal;
