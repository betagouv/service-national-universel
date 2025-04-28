import React from "react";
import { Modal } from "@snu/ds/admin";
import { BsClipboardCheck } from "react-icons/bs";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentCount: number;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, onConfirm, studentCount }) => {
  const header = (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <BsClipboardCheck className="w-8 h-8 text-gray-800" />
      </div>
    </div>
  );

  const content = (
    <div className="text-center">
      <h2 className="text-2xl font-medium mb-4">Vous vous apprêtez à inscrire {studentCount} nouveaux élèves à cette classe.</h2>
    </div>
  );

  const footer = (
    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
      <button onClick={onClose} className="w-full sm:w-1/2 px-6 py-3 rounded-lg border border-gray-300 text-base font-medium text-gray-700 hover:bg-gray-50">
        Annuler
      </button>
      <button
        onClick={onConfirm}
        className="w-full sm:w-1/2 px-6 py-3 rounded-lg bg-blue-600 text-white text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        Confirmer l'inscription
      </button>
    </div>
  );

  return <Modal isOpen={isOpen} onClose={onClose} header={header} content={content} footer={footer} className="sm:max-w-lg mx-auto" />;
};
