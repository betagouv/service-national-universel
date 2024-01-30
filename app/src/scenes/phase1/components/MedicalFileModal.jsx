import React from "react";
import Modal from "../../../components/ui/modals/Modal";
import Close from "../../../assets/Close";
import ButtonLight from "../../../components/ui/buttons/ButtonLight";
import ExternalLink from "../../../components/ui/buttons/ExternalLink";
import EnumeratedList from "./EnumeratedList";

const MedicalFileModal = ({ isOpen, onClose, title = "Téléchargez votre fiche sanitaire" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full bg-white md:w-[512px]">
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
          <div className="mb-6 h-[1px] w-full bg-gray-200"></div>
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
