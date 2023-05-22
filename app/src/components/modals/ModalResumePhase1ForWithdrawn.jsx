import React from "react";
import ButtonLight from "../ui/buttons/ButtonLight";
import ButtonLinkPrimary from "../ui/buttons/ButtonLinkPrimary";
import Modal from "../ui/modals/Modal";

export default function ModalResumePhase1ForWithdrawn({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[512px] rounded-xl bg-white p-6">
      <p className="text-center text-xl font-medium leading-7 text-gray-900">Reprendre mon parcours</p>
      <p className="m-2 text-center text-sm leading-5 text-gray-500">
        Vous vous êtes désisté du SNU.
        <br />
        Avez-vous changé d&apos;avis ?
        <br />
        Vous pouvez reprendre votre parcours en vous inscrivant à un prochain séjour.
      </p>
      <div className="mt-12 grid grid-rows-2 gap-3 md:grid-cols-2 md:grid-rows-1">
        <ButtonLinkPrimary to="changer-de-sejour" className="shadow-ninaBlue drop-shadow-none md:order-last" onClick={onClose}>
          Choisir un nouveau séjour
        </ButtonLinkPrimary>
        <ButtonLight onClick={onClose}>Quitter</ButtonLight>
      </div>
    </Modal>
  );
}
