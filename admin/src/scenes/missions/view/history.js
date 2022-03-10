import React from "react";

import WrapperHistory from "./wrapper";
import HistoricComponent from "../../../components/views/Historic";

export default function History({ mission }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperHistory mission={mission} tab="historique">
        <HistoricComponent model="mission" value={mission} />
      </WrapperHistory>
    </div>
  );
}
