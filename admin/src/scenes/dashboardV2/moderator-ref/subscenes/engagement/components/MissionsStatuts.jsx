import React, { useEffect, useState } from "react";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { translate } from "snu-lib";
import StatusTable from "../../../../components/ui/StatusTable";
import HorizontalMiniBar from "../../../../components/graphs/HorizontalMiniBar";
import { apiURL } from "../../../../../../config";
import ExportComponent from "../../../../../../components/ExportXlsx";
import plausibleEvent from "../../../../../../services/plausible";
import { ReactiveBase } from "@appbaseio/reactivesearch";
import { ES_NO_LIMIT } from "../../../../../../utils";
import { computeMissionUrl } from "../../../../components/common";

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
      const result = await api.post(`/dashboard/engagement/missions-statuts`, { filters, missionFilters });
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

        const exportFilter = [];
        if (missionFilters.start) {
          exportFilter.push({ range: { startAt: missionFilters.start } });
        }
        if (missionFilters.end) {
          exportFilter.push({ range: { endAt: missionFilters.end } });
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

  function getExportQuery() {
    return {
      query: {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          filtered: {
            filter: {
              bool: {
                must: exportFilter,
              },
            },
            aggs: {
              regions: {
                terms: { field: "region.keyword", size: ES_NO_LIMIT },
                aggs: {
                  departments: {
                    terms: { field: "department.keyword", size: ES_NO_LIMIT },
                    aggs: {
                      status: {
                        terms: { field: "status.keyword" },
                        aggs: {
                          placesTotal: { sum: { field: "placesTotal" } },
                          placesLeft: { sum: { field: "placesLeft" } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        size: 0,
      },
    };
  }

  const exportButton = (
    <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <ExportComponent
        searchType="_msearch"
        handleClick={() => plausibleEvent("Mission/DashBoard - Exporter le détail des missions")}
        title="Exporter le détail des missions"
        defaultQuery={getExportQuery}
        exportTitle="Missions"
        index="mission"
        transform={async (data) => {
          const regions = data.aggregations.filtered.regions.buckets;
          let result = [];
          for (const region of regions) {
            for (const department of region.departments.buckets) {
              const status = department.status.buckets;
              result.push({
                ["Région"]: region.key,
                ["Département"]: department.key,

                ["Brouillon - Nombre de missions déposées"]: status.find((stat) => stat.key === "DRAFT")?.doc_count || 0,
                ["Brouillon - Nombre de places totales"]: status.find((stat) => stat.key === "DRAFT")?.placesTotal.value || 0,
                ["Brouillon - Nombre de places disponibles"]: status.find((stat) => stat.key === "DRAFT")?.placesLeft.value || 0,
                ["Brouillon - Nombre de places occupées"]:
                  status.find((stat) => stat.key === "DRAFT")?.placesTotal.value - status.find((stat) => stat.key === "DRAFT")?.placesLeft.value || 0,

                ["En attente de validation - Nombre de missions déposées"]: status.find((stat) => stat.key === "WAITING_VALIDATION")?.doc_count || 0,
                ["En attente de validation - Nombre de places totales"]: status.find((stat) => stat.key === "WAITING_VALIDATION")?.placesTotal.value || 0,
                ["En attente de validation - Nombre de places disponibles"]: status.find((stat) => stat.key === "WAITING_VALIDATION")?.placesLeft.value || 0,
                ["En attente de validation - Nombre de places occupées"]:
                  status.find((stat) => stat.key === "WAITING_VALIDATION")?.placesTotal.value - status.find((stat) => stat.key === "WAITING_VALIDATION")?.placesLeft.value || 0,

                ["En attente de correction - Nombre de missions déposées"]: status.find((stat) => stat.key === "WAITING_CORRECTION")?.doc_count || 0,
                ["En attente de correction - Nombre de places totales"]: status.find((stat) => stat.key === "WAITING_CORRECTION")?.placesTotal.value || 0,
                ["En attente de correction - Nombre de places disponibles"]: status.find((stat) => stat.key === "WAITING_CORRECTION")?.placesLeft.value || 0,
                ["En attente de correction - Nombre de places occupées"]:
                  status.find((stat) => stat.key === "WAITING_CORRECTION")?.placesTotal.value - status.find((stat) => stat.key === "WAITING_CORRECTION")?.placesLeft.value || 0,

                ["Validée - Nombre de missions déposées"]: status.find((stat) => stat.key === "VALIDATED")?.doc_count || 0,
                ["Validée - Nombre de places totales"]: status.find((stat) => stat.key === "VALIDATED")?.placesTotal.value || 0,
                ["Validée - Nombre de places disponibles"]: status.find((stat) => stat.key === "VALIDATED")?.placesLeft.value || 0,
                ["Validée - Nombre de places occupées"]:
                  status.find((stat) => stat.key === "VALIDATED")?.placesTotal.value - status.find((stat) => stat.key === "VALIDATED")?.placesLeft.value || 0,

                ["Refusée - Nombre de missions déposées"]: status.find((stat) => stat.key === "REFUSED")?.doc_count || 0,
                ["Refusée - Nombre de places totales"]: status.find((stat) => stat.key === "REFUSED")?.placesTotal.value || 0,
                ["Refusée - Nombre de places disponibles"]: status.find((stat) => stat.key === "REFUSED")?.placesLeft.value || 0,
                ["Refusée - Nombre de places occupées"]:
                  status.find((stat) => stat.key === "REFUSED")?.placesTotal.value - status.find((stat) => stat.key === "REFUSED")?.placesLeft.value || 0,

                ["Annulée - Nombre de missions déposées"]: status.find((stat) => stat.key === "CANCEL")?.doc_count || 0,
                ["Annulée - Nombre de places totales"]: status.find((stat) => stat.key === "CANCEL")?.placesTotal.value || 0,
                ["Annulée - Nombre de places disponibles"]: status.find((stat) => stat.key === "CANCEL")?.placesLeft.value || 0,
                ["Annulée - Nombre de places occupées"]:
                  status.find((stat) => stat.key === "CANCEL")?.placesTotal.value - status.find((stat) => stat.key === "CANCEL")?.placesLeft.value || 0,

                ["Archivée - Nombre de missions déposées"]: status.find((stat) => stat.key === "ARCHIVED")?.doc_count || 0,
                ["Archivée - Nombre de places totales"]: status.find((stat) => stat.key === "ARCHIVED")?.placesTotal.value || 0,
                ["Archivée - Nombre de places disponibles"]: status.find((stat) => stat.key === "ARCHIVED")?.placesLeft.value || 0,
                ["Archivée - Nombre de places occupées"]:
                  status.find((stat) => stat.key === "ARCHIVED")?.placesTotal.value - status.find((stat) => stat.key === "ARCHIVED")?.placesLeft.value || 0,
              });
            }
          }
          return result;
        }}
        css={{ override: true, button: "bg-gray-100 rounded text-gray-900 text-xs font-medium py-[7px] px-[10px] hover:bg-gray-200" }}
      />
    </ReactiveBase>
  );

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
