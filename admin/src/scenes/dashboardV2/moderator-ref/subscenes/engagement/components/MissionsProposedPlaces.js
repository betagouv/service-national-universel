import React, { useEffect, useState } from "react";
import { DemiDoughnut } from "../../../../components/graphs";
import Loader from "../../../../../../components/Loader";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";

export default function MissionsProposedPlaces({ filters, missionFilters, className = "" }) {
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [filters, missionFilters]);

  async function loadData() {
    setError(null);
    setGraph(null);
    try {
      const result = await api.post(`/dashboard/engagement/mission-proposed-places`, { filters, missionFilters });
      if (result.ok) {
        console.log("RESULT: ", result.data);
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
    <DashboardBox title="Places proposées" className={`!pb-0 ${className}`}>
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : graph === null ? (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <DemiDoughnut labels={graph.labels} values={graph.values} className="mt-8" tooltipsPercent />
      )}
    </DashboardBox>
  );
}
