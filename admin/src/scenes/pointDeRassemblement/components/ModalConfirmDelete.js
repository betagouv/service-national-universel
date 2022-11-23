import React from "react";
import ModalTailwind from "../../../components/modals/ModalTailwind";

export default function ModalConfirmDelete({ isOpen, onCancel, onDelete }) {
  return <ModalTailwind isOpen={isOpen} onClose={onCancel} size="w-[600px]"></ModalTailwind>;
}
