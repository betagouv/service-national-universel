import React from "react";
import ModalTailwind from "../../../components/modals/ModalTailwind";

export default function ModalConfirmDelete({ isOpen, onCancel, onDelete, title, message }) {
  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[512px] rounded-lg bg-white shadow-xl">
      <div className="flex w-full flex-col items-center gap-4 p-8">
        <div className="text-xl font-medium leading-7 text-gray-900">{title}</div>
        <div className="text-sm leading-5 text-gray-500">{message}</div>
        <div className="mt-4 flex w-full items-center gap-4">
          <button onClick={onCancel} className="w-1/2 rounded-lg border-[1px] border-gray-300 py-2 hover:shadow-ninaButton ">
            Annuler
          </button>
          <button onClick={onDelete} className="w-1/2 rounded-lg border-[1px] border-red-600 bg-red-600 py-2 text-white hover:shadow-ninaButton ">
            Supprimer
          </button>
        </div>
      </div>
    </ModalTailwind>
  );
}
