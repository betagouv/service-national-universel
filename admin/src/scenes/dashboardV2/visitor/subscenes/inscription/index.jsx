import React, { useState } from "react";
import { HiOutlineChartSquareBar } from "react-icons/hi";

import General from "@/scenes/dashboardV2/components/inscription/General";
import { Page, Header } from "@snu/ds/admin";

export default function Index() {
  const [selectedFilters, setSelectedFilters] = useState({
    cohort: [],
  });

  return (
    <Page>
      <Header title="Tableau de bord" breadcrumb={[{ title: <HiOutlineChartSquareBar size={20} /> }, { title: "Tableau de bord" }]} />
      <General selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
    </Page>
  );
}
