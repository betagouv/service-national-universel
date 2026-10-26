import React from "react";
import { useHistory } from "react-router-dom";

export default function ButtonInscriptionManuelle({ id }) {
  const history = useHistory();

  const onManualInscription = () => {
    history.push(`/classes/${id}/inscription-manuelle`);
  };

  return (
    <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={onManualInscription}>
      Inscrire manuellement un élève
    </button>
  );
}
