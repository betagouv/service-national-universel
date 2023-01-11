import React from "react";
import ModalTailwind from "../../../components/modals/ModalTailwind";

export default function ModalDispense({ isOpen, onCancel }) {
  return (
    <ModalTailwind centered isOpen={isOpen} onClose={onCancel} className="w-[512px] bg-white rounded-lg py-4 px-8">
      <div className="text-gray-900 font-medium text-center text-xl my-2">Renseignez un motif de dispense</div>
      <div className="text-gray-500 text-sm">
        La dispence de séjour permet de réaliser sa phase 2 et 3 sans ouvrir les droits à la prise en charge du code de la route ni à l&apos;équivalence JDC.
      </div>
      <div className="w-full flex items-center justify-center gap-4 font-medium">
        <div className="w-1/2 border-[1px] border-gray-300 text-center py-2 rounded">Retour</div>
        <div className="w-1/2 border-[1px] bg-blue-600 text-white text-center py-2 rounded">Valider</div>
      </div>
    </ModalTailwind>
  );
}
