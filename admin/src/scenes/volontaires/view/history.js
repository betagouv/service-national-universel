import React from "react";

import HistoricComponent from "../../../components/views/Historic";
import YoungHeader from "../../phase0/components/YoungHeader";

export default function History({ young, onChange }) {
  return (
    <>
      <YoungHeader young={young} tab="historique" onChange={onChange} />
      <div className="p-[30px]">
        <HistoricComponent model="young" value={young} />
      </div>
    </>
  );
}
