import React from "react";
import { Modal } from "reactstrap";

import { ModalContainer } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import { AiOutlineCheckCircle } from "react-icons/ai";

export default function ModalReferentDeleted({ isOpen, onConfirm }) {
  return (
    <Modal centered isOpen={isOpen} toggle={onConfirm}>
      <ModalContainer className="flex flex-col items-center justify-center gap-4">
        <AiOutlineCheckCircle className="h-10 w-10 text-green-700" />
        <div className="flex w-[80%] flex-col items-center justify-center gap-2">
          <h1 className="text-xl font-medium">Le compte a bien été supprimé</h1>
        </div>

        <div className="mb-4 flex w-full flex-col items-center justify-center">
          <ModalButton onClick={onConfirm}>Fermer</ModalButton>
        </div>
      </ModalContainer>
    </Modal>
  );
}
