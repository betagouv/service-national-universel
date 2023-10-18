import React from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";

import plausibleEvent from "../../../../../services/plausible";
import ExportReport from "./ExportReport";

import General from "@/scenes/dashboardV2/components/inscription/General";

export default function Index() {
  const [selectedFilters, setSelectedFilters] = React.useState({
    cohort: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"],
  });

  return (
    <DashboardContainer
      active="inscription"
      availableTab={["general", "engagement", "sejour", "inscription"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ExportReport filter={selectedFilters} />
          <ButtonPrimary
            className="text-sm"
            onClick={() => {
              plausibleEvent("Dashboard/CTA - Exporter statistiques inscriptions");
              print();
            }}>
            Exporter les statistiques <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
        </div>
      }>
      <General selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
    </DashboardContainer>
  );
}
