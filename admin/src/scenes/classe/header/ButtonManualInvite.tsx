import React from "react";

import { useHistory } from "react-router-dom";

import plausibleEvent from "@/services/plausible";

export default function ButtonManualInvite({ id }) {
  const history = useHistory();

  const onInscription = () => {
    plausibleEvent("Inscriptions/CTA - Nouvelle inscription");

    history.push(`/volontaire/create?classeId=${id}`);
  };

  return (
    <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={onInscription}>
      Inscrire manuellement un élève
    </button>
  );
}
