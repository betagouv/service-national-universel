import React from "react";
import { useHistory } from "react-router-dom";
import plausibleEvent from "@/services/plausible";

export default function ButtonInscriptionEnMasse({ id }) {
  const history = useHistory();

  const onBulkInscription = () => {
    plausibleEvent("CLE/CTA - Inscription en masse");
    history.push(`/classes/${id}/inscription-masse`);
  };

  return (
    <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={onBulkInscription}>
      Inscrire les élèves en masse
    </button>
  );
}
