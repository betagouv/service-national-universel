import React from "react";
import { Modal } from "reactstrap";

export default function ModalInform({ isOpen, onCancel }) {
  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} showCloseIcon={false}>
      <div className="w-full">
        <div className="mx-4">
          <div className="my-4 flex items-center justify-center text-xl font-medium text-gray-900">En savoir plus</div>
          <div className="flex items-center justify-center text-center text-sm font-normal text-gray-500">
            Les informations collectées dans le cadre d’une candidature de votre part pour effectuer une préparation militaire sont destinées à vérifier l’éligibilité de votre
            demande : en effet, l’accès aux préparations militaires est soumis à des conditions prévues par l’article 2 de l’arrêté du 21 avril 2008 relatif aux périodes militaires
            d&apos;initiation ou de perfectionnement à la défense nationale paru au JORF n°0102 du 30 avril 2008. Les documents que vous téléversez sur cette page sont destinés aux
            services académiques de votre département de résidence et aux référents des missions d’intérêt général / préparations militaires auxquelles vous postulez. Ces pièces
            seront conservées jusqu’à l’examen de votre candidature et, si votre candidature est acceptée, jusqu’à la fin de la préparation militaire que vous effectuerez. Sans la
            fourniture de ces pièces, l’éligibilité de votre candidature ne pourra pas être étudiée.
          </div>

          <button className="my-4 flex w-full cursor-pointer items-center justify-center rounded-lg border-[1px] border-gray-300 py-2 text-gray-700" onClick={onCancel}>
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
