import React from "react";

import WrapperHistory from "./wrapper";
import HistoricComponent from "../../../components/views/Historic";

export default function History({ structure }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperHistory structure={structure} tab="historique">
        <HistoricComponent model="structure" value={structure} />
      </WrapperHistory>
    </div>
  );
}
