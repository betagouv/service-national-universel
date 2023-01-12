import React, { useEffect, useState } from "react";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import TailwindSelect from "../../../components/TailwindSelect";
import { translate, YOUNG_STATUS_PHASE1_MOTIF } from "snu-lib";
import API from "../../../services/api";
import { toastr } from "react-redux-toastr";

export default function ModalDispense({ isOpen, onCancel, youngId, onSuccess }) {
  const [valueDispense, setValueDispence] = useState("");
  const [text, setText] = useState("");
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (valueDispense && text) return setDisabled(false);
    setDisabled(true);
  }, [text, valueDispense]);

  const options = Object.keys(YOUNG_STATUS_PHASE1_MOTIF).map((e) => {
    return { label: translate(e), value: e };
  });

  const onSubmit = async () => {
    if (disabled) return;

    try {
      setDisabled(true);
      const { ok, data } = await API.post(`/young/${youngId}/phase1/dispense`, {
        statusPhase1MotifDetail: text,
        statusPhase1Motif: valueDispense,
      });
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la dispense du jeune");
      }
      toastr.success("Le jeune a bien été dispensé");
      console.log(data);
      onSuccess(data);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue lors de la dispense du jeune");
      console.log(e);
    }
  };
  return (
    <ModalTailwind centered isOpen={isOpen} onClose={onCancel} className="w-[512px] bg-white rounded-lg py-3 px-3">
      <div className="text-gray-900 font-medium text-center text-xl my-2">Renseignez un motif de dispense</div>
      <div className="text-gray-500 text-sm text-center">
        La dispence de séjour permet de réaliser sa phase 2 et 3 sans ouvrir les droits à la prise en charge du code de la route ni à l&apos;équivalence JDC.
      </div>

      <div className="my-4 mx-2 flex flex-col gap-4">
        <TailwindSelect
          name="statusPhase1Motif"
          label="Motif de dispense"
          type="select"
          setSelected={({ value }) => setValueDispence(value)}
          selected={valueDispense}
          options={options}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border-[1px] border-gray-300 rounded w-full py-2 px-2.5"
          rows={5}
          placeholder="Ajoutez un texte explicatif..."
        />
      </div>

      <div className="w-full flex items-center justify-center gap-4 font-medium">
        <div className="cursor-pointer w-1/2 border-[1px] border-gray-300 text-center py-2 rounded" onClick={onCancel}>
          Retour
        </div>
        <div onClick={onSubmit} className={`${disabled ? "opacity-70" : "cursor-pointer"} w-1/2 border-[1px] bg-blue-600 text-white text-center py-2 rounded`}>
          Valider
        </div>
      </div>
    </ModalTailwind>
  );
}
