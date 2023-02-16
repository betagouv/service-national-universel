import React from "react";

import WrapperHistory from "./wrapper";
import WrapperHistoryV2 from "./wrapperv2";
import HistoricComponent from "../../../components/views/Historic";
import { environment } from "../../../config";

export default function History({ structure }) {
  if (environment === "production")
    return (
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <WrapperHistory structure={structure} tab="historique">
          <HistoricComponent model="structure" value={structure} />
        </WrapperHistory>
      </div>
    );
  return (
    <WrapperHistoryV2 tab="historique">
      <HistoricComponent model="structure" value={structure} />
    </WrapperHistoryV2>
  );
}
