import React from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";

export default function Index() {
  return (
    <DashboardContainer
      active="sejour"
      availableTab={["general", "sejour"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Séjour”</span>
          </ButtonPrimary>
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Séjour”</span>
          </ButtonPrimary>
        </div>
      }>
      <div>Séjour</div>
    </DashboardContainer>
  );
}
