import React, { useEffect, useState } from "react";
import { FullDoughnut } from "../../../../components/graphs";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { translate, translatePhase1, translatePhase2 } from "snu-lib";
import { LoadingDoughnut } from "../../../../components/ui/loading";
import { getNewLink } from "@/utils";
import queryString from "query-string";

export default function VolontairesStatutsDePhase({ filters, className = "" }) {
  const [phase, setPhase] = useState(1);
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  function selectPhase(e) {
    setPhase(parseInt(e.target.value));
  }

  async function loadData() {
    setError(null);
    setGraph(null);
    try {
      const result = await api.post(`/elasticsearch/dashboard/engagement/status-de-phases`, { filters });
      if (result.ok) {
        let formatResult = result.data.reduce((acc, curr) => {
          const phase = curr.phase;
          const labels = [];
          const values = [];
          const legendUrls = [];
          for (const data of curr.result) {
            labels.push(phase === 1 ? translatePhase1(data.key) : phase === 2 ? translatePhase2(data.key) : translate(data.key));
            values.push(data.doc_count);
            legendUrls.push(
              getNewLink(
                {
                  base: `/volontaire`,
                  filter: filters,
                  filtersUrl: [queryString.stringify({ [`statusPhase${phase}`]: encodeURIComponent(data.key) })],
                },
                "session",
              ),
            );
          }
          acc[phase] = { labels, values, legendUrls };
          return acc;
        }, {});
        setGraph(formatResult);
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("unable to load volontaires statuts de phase data: ", err);
      setError("Erreur: impossible de charger les données.");
    }
  }

  const phaseSelector = (
    <select className="" value={phase} onChange={selectPhase}>
      <option value={1}>Phase 1</option>
      <option value={2}>Phase 2</option>
      <option value={3}>Phase 3</option>
    </select>
  );

  return (
    <DashboardBox title="Statuts de phase" headerChildren={phaseSelector} className={`flex flex-col ${className}`} childrenClassName="grow">
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : graph === null ? (
        <div className="h-100 flex items-center justify-center">
          <LoadingDoughnut />
        </div>
      ) : (
        <FullDoughnut
          labels={graph[phase].labels}
          values={graph[phase].values}
          legendUrls={graph[phase].legendUrls}
          legendSide="bottom"
          maxLegends={2}
          className="mt-8"
          tooltipsPercent
        />
      )}
    </DashboardBox>
  );
}
