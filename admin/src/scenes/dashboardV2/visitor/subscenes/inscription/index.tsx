import React, { useState } from "react";

import { Page, Header } from "@snu/ds/admin";

import General from "../../../components/inscription/General";

export default function Index() {
  const [selectedFilters, setSelectedFilters] = useState<{ cohort: string[]; department?: string; region?: string; academy?: string }>({
    cohort: [],
  });

  return (
    <Page>
      <Header title="Tableau de bord" breadcrumb={[{ title: "Tableau de bord" }]} />
      <General selectedFilters={selectedFilters} onSelectedFiltersChange={setSelectedFilters} />
    </Page>
  );
}
