import React from "react";
import { Modal } from "reactstrap";

import { ModalContainer } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import { AiOutlineCheckCircle } from "react-icons/ai";

export default function ModalReferentDeleted({ isOpen, onConfirm }) {
  return (
    <Modal centered isOpen={isOpen} toggle={onConfirm}>
      <ModalContainer className="flex flex-col items-center justify-center gap-4">
        <AiOutlineCheckCircle size={40} color={"green"} />
        <div className="flex flex-col items-center justify-center gap-2 w-[80%]">
          <h1 className="font-medium text-xl">Le compte a bien été supprimé</h1>
        </div>

        <div className="flex flex-col items-center justify-center mb-4 w-full">
          <ModalButton onClick={onConfirm}>Fermer</ModalButton>
        </div>
      </ModalContainer>
    </Modal>
  );
}
