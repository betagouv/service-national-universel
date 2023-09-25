import React, { useEffect, useState } from "react";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import StatusTable from "../../../../components/ui/StatusTable";
import HorizontalMiniBar from "../../../../components/graphs/HorizontalMiniBar";
import { computeMissionUrl } from "../../../../components/common";
import ExportMissionStatusReport from "./ExportMissionStatusReport";
import { translate } from "snu-lib";

export default function MissionsStatuts({ filters, missionFilters, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [exportFilter, setExportFilter] = useState({});

  useEffect(() => {
    loadData();
  }, [filters, missionFilters]);

  async function loadData() {
    setError(null);
    setLoading(true);
    try {
      const result = await api.post(`/elasticsearch/dashboard/engagement/missions-statuts`, { filters, missionFilters });
      if (result.ok) {
        setStatuses(
          result.data.map((status) => {
            return {
              status: translate(status.status),
              nb: status.value,
              percentage: Math.round(status.percentage * 100),
              info: (
                <HorizontalMiniBar
                  title="Places proposées"
                  values={[status.total - Math.min(status.total, status.left), Math.min(status.total, status.left)]}
                  labels={["occupées", "disponibles"]}
                />
              ),
              url: computeMissionUrl(filters, missionFilters, { STATUS: status.status }),
            };
          }),
        );

        // --- compute export filter
        const exportFilter = {};
        if (filters.department) {
          exportFilter.department = filters.department;
        }
        if (filters.region) {
          exportFilter.region = filters.region;
        }
        if (missionFilters.start) {
          exportFilter.fromDate = missionFilters.start;
        }
        if (missionFilters.end) {
          exportFilter.toDate = missionFilters.end;
        }
        if (missionFilters.sources) {
          if (missionFilters.sources.includes("JVA")) {
            if (missionFilters.sources.includes("SNU")) {
              // rien sur le filtre
            } else {
              exportFilter.isJvaMission = "true";
            }
          } else {
            if (missionFilters.sources.includes("SNU")) {
              exportFilter.isJvaMission = "false";
            } else {
              // rien sur le filtre
            }
          }
        }
        setExportFilter(exportFilter);
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

  const exportButton = <ExportMissionStatusReport filter={exportFilter} />;

  return (
    <DashboardBox title="Statut des missions proposées" className={className} headerChildren={exportButton}>
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : (
        <StatusTable className="mt-8" statuses={statuses} loading={loading} />
      )}
    </DashboardBox>
  );
}
