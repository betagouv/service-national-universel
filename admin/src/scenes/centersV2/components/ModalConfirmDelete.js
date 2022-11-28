import React from "react";
import ModalTailwind from "../../../components/modals/ModalTailwind";

export default function ModalConfirmDelete({ isOpen, onCancel, onDelete, title, message }) {
  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[512px] bg-white rounded-lg shadow-xl">
      <div className="flex flex-col p-8 w-full items-center gap-4">
        <div className="text-xl font-medium leading-7 text-gray-900">{title}</div>
        <div className="text-sm leading-5 text-gray-500">{message}</div>
        <div className="flex items-center gap-4 w-full mt-4">
          <button onClick={onCancel} className="w-1/2 border-[1px] border-gray-300 py-2 rounded-lg hover:shadow-ninaButton ">
            Annuler
          </button>
          <button onClick={onDelete} className="border-[1px] border-red-600 text-white bg-red-600 py-2 w-1/2 rounded-lg hover:shadow-ninaButton ">
            Supprimer
          </button>
        </div>
      </div>
    </ModalTailwind>
  );
}
