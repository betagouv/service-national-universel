import React from "react";
import ModalTailwind from "../../../components/modals/ModalTailwind";

export default function ModalDispence({ isOpen, onCancel }) {
  return (
    <ModalTailwind centered isOpen={isOpen} onClose={onCancel} className="w-[512px] bg-white rounded-lg py-2 px-8">
      <div className="text-gray-900 font-medium text-center text-xl">Renseignez un motif de dispense</div>
      <div className="text-gray-500 text-sm">
        La dispence de séjour permet de réaliser sa phase 2 et 3 sans ouvrir les droits à la prise en charge du code de la route ni à l&apos;équivalence JDC.
      </div>
    </ModalTailwind>
  );
}
