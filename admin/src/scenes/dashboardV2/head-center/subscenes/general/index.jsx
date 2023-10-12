import React from "react";

import DashboardContainer from "../../../components/DashboardContainer";

export default function Index() {
  return (
    <DashboardContainer active="general" availableTab={["general", "sejour"]}>
      <div>Général</div>
    </DashboardContainer>
  );
}
