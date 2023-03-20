import React from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";

export default function Index() {
  return (
    <DashboardContainer
      active="inscription"
      availableTab={["general", "engagement", "sejour", "inscription"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
          <ButtonPrimary className="text-sm">
            Exporter les statistiques <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
        </div>
      }>
      <div>Inscription</div>
    </DashboardContainer>
  );
}
