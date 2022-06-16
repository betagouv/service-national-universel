import React from "react";
import { Modal } from "reactstrap";

export default function ModalInform({ isOpen, onCancel }) {
  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} showCloseIcon={false}>
      <div className="w-full">
        <div className="mx-4">
          <div className="flex items-center justify-center text-gray-900 text-xl font-medium my-4">En savoir plus</div>
          <div className="flex items-center justify-center text-gray-500 text-sm font-normal text-center">
            Les informations collectées dans le cadre d’une candidature de votre part pour effectuer une préparation militaire sont destinées à vérifier l’éligibilité de votre
            demande : en effet, l’accès aux préparations militaires est soumis à des conditions prévues par l’article 2 de l’arrêté du 21 avril 2008 relatif aux périodes militaires
            d&apos;initiation ou de perfectionnement à la défense nationale paru au JORF n°0102 du 30 avril 2008. Les documents que vous téléversez sur cette page sont destinés aux
            services académiques de votre département de résidence et aux référents des missions d’intérêt général / préparations militaires auxquelles vous postulez. Ces pièces
            seront conservées jusqu’à l’examen de votre candidature et, si votre candidature est acceptée, jusqu’à la fin de la préparation militaire que vous effectuerez. Sans la
            fourniture de ces pièces, l’éligibilité de votre candidature ne pourra pas être étudiée.
          </div>

          <button className="my-4 flex items-center justify-center border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full" onClick={onCancel}>
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
