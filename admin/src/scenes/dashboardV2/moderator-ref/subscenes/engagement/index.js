import React from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";

export default function Index() {
  return (
    <DashboardContainer
      availableTab={["general", "engagement", "sejour", "inscription"]}
      active="engagement"
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Engagement”</span>
          </ButtonPrimary>
          <ButtonPrimary className="text-sm">
            Exporter les statistiques <span className="font-bold">“Engagement”</span>
          </ButtonPrimary>
        </div>
      }>
      <div>Engagement</div>
    </DashboardContainer>
  );
}
