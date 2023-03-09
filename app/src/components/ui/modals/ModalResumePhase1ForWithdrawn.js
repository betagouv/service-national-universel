import React from "react";
import ButtonCancel from "../buttons/ButtonCancel";
import LinkPrimary from "../buttons/LinkPrimary";
import Modal from "./Modal";

export default function ModalResumePhase1ForWithdrawn({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[512px] bg-white rounded-xl p-6">
      <p className="text-center text-xl text-gray-900 leading-7 font-medium">Reprendre mon parcours</p>
      <p className="text-center text-sm text-gray-500 leading-5 m-2">
        Vous vous êtes désisté du SNU. Vous avez changé d&apos;avis ?
        <br />
        Vous pouvez reprendre votre parcours SNU en vous inscrivant à un prochain séjour.
      </p>
      <div className="grid grid-cols-2 gap-4 mt-12">
        <ButtonCancel onClick={onClose}>Quitter</ButtonCancel>
        <LinkPrimary to="changer-de-sejour" onClick={onClose}>
          Choisir un nouveau séjour
        </LinkPrimary>
      </div>
    </Modal>
  );
}
