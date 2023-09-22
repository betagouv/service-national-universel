import React, { useEffect, useState } from "react";
import { DemiDoughnut } from "../../../../components/graphs";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { computeMissionUrl } from "../../../../components/common";
import { LoadingDemiDoughnut } from "../../../../components/ui/loading";

export default function MissionsProposedPlaces({ filters, missionFilters, className = "" }) {
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    loadData();
    setUrl(computeMissionUrl(filters, missionFilters));
  }, [filters, missionFilters]);

  async function loadData() {
    setError(null);
    setGraph(null);
    try {
      const result = await api.post("/elasticsearch/dashboard/engagement/mission-proposed-places", { filters, missionFilters });
      console.log("🚀 ~ file: MissionsProposedPlaces.jsx:24 ~ loadData ~ result:", result)
      if (result.ok) {
        const values = [result.data.occupied, result.data.left];
        const labels = ["Occupées", "Disponibles"];
        setGraph({ values, labels });
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("unable to load missions proposed places data: ", err);
      setError("Erreur: impossible de charger les données.");
    }
  }

  return (
    <DashboardBox title="Places proposées" className={`flex flex-col !pb-0 ${className}`} childrenClassName="grow flex items-end" to={url}>
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : graph === null ? (
        <div className="flex items-end justify-center">
          <LoadingDemiDoughnut />
        </div>
      ) : (
        <DemiDoughnut labels={graph.labels} values={graph.values} className="mt-8" tooltipsPercent />
      )}
    </DashboardBox>
  );
}
