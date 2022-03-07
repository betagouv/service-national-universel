import React from "react";

import WrapperHistory from "./wrapper";
import HistoricComponent from "../../../components/views/Historic";

export default function History({ young, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperHistory young={young} tab="historique" onChange={onChange}>
        <HistoricComponent model="young" value={young} />
      </WrapperHistory>
    </div>
  );
}
