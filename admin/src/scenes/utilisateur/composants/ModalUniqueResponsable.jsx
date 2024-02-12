import React from "react";
import { Modal } from "reactstrap";

import { IoWarningOutline } from "react-icons/io5";
import { ModalContainer } from "../../../components/modals/Modal";
import ModalButton from "../../../components/buttons/ModalButton";
import { ROLES } from "@/utils";

export default function ModalUniqueResponsable({ isOpen, onConfirm, responsable }) {
  if (!responsable) return null;

  return (
    <Modal centered isOpen={isOpen} toggle={onConfirm}>
      <ModalContainer className="flex flex-col items-center justify-center gap-4">
        <IoWarningOutline size={40} color={"red"} />
        <div className="flex w-[80%] flex-col items-center justify-center gap-2">
          <h1 className="text-xl font-bold">Le compte ne peut pas être supprimé</h1>
          <div className="text-center">
            {responsable.role === ROLES.RESPONSIBLE ? (
              <p>
                {responsable.firstName} {responsable.lastName} est le seul responsable de la structure. Par conséquent, son compte ne peut pas être supprimé.
              </p>
            ) : (
              <p>
                {responsable.firstName} {responsable.lastName} est référent de classe. Pour supprimer son compte, veuillez supprimer la classe ou le remplacer par un autre
                référent.
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 flex w-full flex-col items-center justify-center">
          <ModalButton onClick={onConfirm}>Retour</ModalButton>
        </div>
      </ModalContainer>
    </Modal>
  );
}
