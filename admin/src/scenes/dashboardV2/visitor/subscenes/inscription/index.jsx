import React, { useState } from "react";
import General from "@/scenes/dashboardV2/components/inscription/General";

export default function Index() {
  const [selectedFilters, setSelectedFilters] = useState({
    cohort: [],
  });

  return (
    <div className="p-8">
      <General selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
    </div>
  );
}
