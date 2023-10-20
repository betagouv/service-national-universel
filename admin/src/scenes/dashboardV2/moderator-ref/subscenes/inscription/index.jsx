import React from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";

import plausibleEvent from "../../../../../services/plausible";
import ExportReport from "./ExportReport";
import { getCohortNameList } from "@/services/cohort.service";

import General from "@/scenes/dashboardV2/components/inscription/General";

export default function Index() {
  const [selectedFilters, setSelectedFilters] = React.useState({
    cohort: [],
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
