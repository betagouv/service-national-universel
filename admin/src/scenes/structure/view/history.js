import React from "react";

import WrapperHistory from "./wrapper";
import WrapperHistoryV2 from "./wrapperv2";
import HistoricComponent from "../../../components/views/Historic";
import { environment } from "../../../config";

export default function History({ structure }) {
  return (
    <WrapperHistoryV2 tab="historique">
      <HistoricComponent model="structure" value={structure} />
    </WrapperHistoryV2>
  );
}
