import React from "react";
import { useHistory } from "react-router-dom";
import plausibleEvent from "@/services/plausible";

export default function ButtonInscriptionManuelle({ id }) {
  const history = useHistory();

  const onManualInscription = () => {
    plausibleEvent("CLE/CTA - Inscription manuelle");
    history.push(`/classes/${id}/inscription-manuelle`);
  };

  return (
    <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={onManualInscription}>
      Inscrire manuellement un élève
    </button>
  );
}
