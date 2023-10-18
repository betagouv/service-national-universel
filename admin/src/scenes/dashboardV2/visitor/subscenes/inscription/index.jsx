import React, { useState } from "react";
import General from "@/scenes/dashboardV2/components/inscription/General";

export default function Index() {
  const [selectedFilters, setSelectedFilters] = useState({
    cohort: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023", "Octobre 2023 - NC"],
  });

  return (
    <div className="p-8">
      <General selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
    </div>
  );
}
