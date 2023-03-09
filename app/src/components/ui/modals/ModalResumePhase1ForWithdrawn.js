import React from "react";
import ButtonCancel from "../buttons/ButtonCancel";
import LinkPrimary from "../buttons/LinkPrimary";
import Modal from "./Modal";

export default function ModalResumePhase1ForWithdrawn({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[512px] bg-white rounded-xl p-6">
      <p className="text-center text-xl text-gray-900 leading-7 font-medium">Reprendre mon parcours</p>
      <p className="text-center text-sm text-gray-500 leading-5 m-2">
        Vous vous êtes désisté du SNU.
        <br />
        Avez-vous changé d&apos;avis ?
        <br />
        Vous pouvez reprendre votre parcours en vous inscrivant à un prochain séjour.
      </p>
      <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-3 mt-12">
        <LinkPrimary to="changer-de-sejour" className="md:order-last" onClick={onClose}>
          Choisir un nouveau séjour
        </LinkPrimary>
        <ButtonCancel onClick={onClose}>Quitter</ButtonCancel>
      </div>
    </Modal>
  );
}
