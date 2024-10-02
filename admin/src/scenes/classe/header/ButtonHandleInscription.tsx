import React from "react";
import { useHistory } from "react-router-dom";

export default function ButtonHandleInscription({ title, type, id }) {
  const history = useHistory();
  let filter = "";
  if (type === "consent") filter = "inscriptionStep2023=WAITING_CONSENT";
  if (type === "validation") filter = "status=WAITING_VALIDATION";
  if (type === "image") filter = "imageRight=N/A";

  return (
    <button
      type="button"
      className="flex items-center justify-start w-full text-sm leading-5 font-normal"
      onClick={() => history.push(`/mes-eleves/${type}?classeId=${id}&${filter}`)}>
      {title}
    </button>
  );
}
