import React, { useEffect, useState } from "react";
import Loader from "../../../../../../components/Loader";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { translate } from "snu-lib";
import StatusTable from "../../../../components/ui/StatusTable";

export default function MissionsStatuts({ filters, missionFilters, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    loadData();
  }, [filters, missionFilters]);

  async function loadData() {
    setError(null);
    setLoading(true);
    try {
      const result = await api.post(`/dashboard/engagement/missions-statuts`, { filters, missionFilters });
      if (result.ok) {
        setStatuses(result.data.map((status) => ({ status: translate(status.status), nb: status.value, percentage: Math.round(status.percentage * 100) })));
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("unable to load missions statuts: ", err);
      setError("Erreur: impossible de charger les données.");
    }
    setLoading(false);
  }

  async function exportDetail() {
    console.log("TODO: export detail missions...");
  }

  const exportButton = (
    <button className="bg-gray-100 rounded text-gray-900 text-xs font-medium py-[7px] px-[10px] hover:bg-gray-200" onClick={exportDetail}>
      Exporter le détail des missions
    </button>
  );

  return (
    <DashboardBox title="Statut des missions proposées" className={className} headerChildren={exportButton}>
      {error ? (
        <div className="flex justify-center items-center text-center text-sm text-red-600 font-medium p-8">{error}</div>
      ) : loading ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <StatusTable className="mt-8" statuses={statuses} />
      )}
    </DashboardBox>
  );
}
