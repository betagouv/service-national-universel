import React from "react";
import { useHistory } from "react-router-dom";

export default function ButtonHandleInscription({ title, type, id }) {
  const history = useHistory();

  return (
    <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={() => history.push(`/mes-eleves/${type}?classeId=${id}`)}>
      {title}
    </button>
  );
}
