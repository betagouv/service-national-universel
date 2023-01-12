import React, { useState } from "react";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import TailwindSelect from "../../../components/TailwindSelect";

export default function ModalDispense({ isOpen, onCancel }) {
  const [valueDispense, setValueDispence] = useState("");
  return (
    <ModalTailwind centered isOpen={isOpen} onClose={onCancel} className="w-[512px] bg-white rounded-lg py-3 px-3">
      <div className="text-gray-900 font-medium text-center text-xl my-2">Renseignez un motif de dispense</div>
      <div className="text-gray-500 text-sm text-center">
        La dispence de séjour permet de réaliser sa phase 2 et 3 sans ouvrir les droits à la prise en charge du code de la route ni à l&apos;équivalence JDC.
      </div>

      <div className="my-4 mx-2">
        <TailwindSelect
          name="youngPhase1Agreement"
          label="Confirmation de la participation"
          type="select"
          setSelected={(val) => setValueDispence(val)}
          selected={valueDispense}
          options={[
            { label: "Oui", value: "true" },
            { label: "Non", value: "false" },
          ]}
        />
      </div>

      <div className="w-full flex items-center justify-center gap-4 font-medium">
        <div className="w-1/2 border-[1px] border-gray-300 text-center py-2 rounded">Retour</div>
        <div className="w-1/2 border-[1px] bg-blue-600 text-white text-center py-2 rounded">Valider</div>
      </div>
    </ModalTailwind>
  );
}
