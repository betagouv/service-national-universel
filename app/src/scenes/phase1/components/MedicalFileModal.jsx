import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from "../../../components/ui/modals/Modal";
import Close from "../../../assets/Close";
import Download from "../../../assets/icons/Download";
import { SENDINBLUE_TEMPLATES } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import { CDN_BASE_URL } from "../../representants-legaux/commons";
import { HiOutlineMail } from "react-icons/hi";
import ButtonExternalLinkPrimary from "../../../components/ui/buttons/ButtonExternalLinkPrimary";
import ButtonPrimaryOutline from "../../../components/ui/buttons/ButtonPrimaryOutline";
import ButtonLight from "../../../components/ui/buttons/ButtonLight";
import ExternalLink from "../../../components/ui/buttons/ExternalLink";
import EnumeratedList from "./EnumeratedList";
import { toastr } from "react-redux-toastr";
import ConfirmationModal from "../../../components/ui/modals/ConfirmationModal";

const MedicalFileModal = ({ isOpen, onClose, title = "Téléchargez votre fiche sanitaire" }) => {
  const [isSendEmailConfirmationModalOpen, setSendEmailConfirmationModalOpen] = useState(false);
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const updateDocumentInformation = async () => {
    const { ok, data } = await api.put("/young/phase1/cohesionStayMedical", { cohesionStayMedicalFileDownload: "true" });
    if (ok) dispatch(setYoung(data));
  };

  const onClickSendByMailConfirm = async () => {
    try {
      const { ok } = await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`, {
        object: `Fiche sanitaire à compléter`,
        message: "Vous trouverez téléchargeable ci-dessous la fiche sanitaire à compléter.",
        link: CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf" + "?utm_campaign=transactionnel+telecharger+docum&utm_source=notifauto&utm_medium=mail+410+telecharger",
      });
      if (ok) toastr.success(`Document envoyé à ${young.email}`, "");
      else toastr.error("Erreur lors de l'envoie du document", "");
    } catch (error) {
      toastr.error("Erreur lors de l'envoie du document", "");
    } finally {
      setSendEmailConfirmationModalOpen(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full bg-white md:w-[512px]">
      <ConfirmationModal
        isOpen={isSendEmailConfirmationModalOpen}
        onCancel={() => setSendEmailConfirmationModalOpen(false)}
        onClose={() => setSendEmailConfirmationModalOpen(false)}
        onConfirm={onClickSendByMailConfirm}
        title="Envoie de document par mail"
        subTitle={`Vous allez recevoir le lien de téléchargement de la fiche sanitaire par mail à l'adresse ${young.email}.`}
      />
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:items-center md:px-6">
          <Close height={10} width={10} onClick={onClose} className="self-end md:hidden" />
          <h1 className="mb-4 font-medium text-gray-900 md:self-center md:text-lg">{title}</h1>
          <EnumeratedList
            className="self-start"
            items={[
              { title: "Faites remplir la fiche", description: "par un de vos représentants légaux." },
              {
                title: "Joignez-y les documents requis",
                description: "et mettre dans une enveloppe portant la mention",
                detail: "“A l’attention du référent sanitaire, Pli Confidentiel”.",
              },
              { title: "Remettez l’enveloppe à l’arrivée au séjour", description: "à l’équipe d’encadrement sur place." },
            ]}
          />
          <ButtonExternalLinkPrimary
            className="flex w-full items-center justify-center"
            href={CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf"}
            onClick={updateDocumentInformation}
            target="_blank">
            <Download className="mr-1 text-blue-200" />
            {young.cohesionStayMedicalFileDownload === "true" ? `Télécharger de nouveau` : `Télécharger`}
          </ButtonExternalLinkPrimary>
          <ButtonPrimaryOutline
            className="mt-3 flex w-full items-center justify-center"
            onClick={() => {
              setSendEmailConfirmationModalOpen(true);
            }}>
            <HiOutlineMail className="mr-1 h-5 w-5 text-blue-600" />
            Recevoir par email
          </ButtonPrimaryOutline>
          <div className="my-6 h-[1px] w-full bg-gray-200"></div>
          <div className="text-[13px] text-gray-800">
            Rappel <strong>(sauf en Nouvelle-Calédonie)</strong> : Entre 15 et 16 ans, vous devez réaliser un bilan de santé obligatoire auprès de votre médecin traitant. Il est
            fortement recommandé de le faire avant votre séjour de cohésion.
          </div>
          <ExternalLink
            className="mt-2 self-start"
            rel="noreferrer"
            href="https://www.ameli.fr/assure/sante/themes/suivi-medical-de-lenfant-et-de-ladolescent/examen-medical-propose-ladolescent-entre-15-et-16-ans">
            Plus d&apos;informations sur le bilan de santé obligatoire
          </ExternalLink>
          <ExternalLink
            className="mt-3 self-start"
            href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/note_relatives_aux_informations_d_ordre_sanitaire_2022.pdf">
            Note relative aux informations d&apos;ordre sanitaire
          </ExternalLink>
        </div>
        <ButtonLight className="mt-10 hidden w-full md:block" onClick={onClose}>
          Fermer
        </ButtonLight>
      </div>
    </Modal>
  );
};

export default MedicalFileModal;
