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
  }, [filters, phase]);

  function selectPhase(e) {
    setPhase(parseInt(e.target.value));
  }

  async function loadData() {
    setError(null);
    setGraph(null);
    try {
      const result = await api.post(`/dashboard/engagement/volontaires-statuts-phase`, { filters, phase });
      if (result.ok) {
        // console.log("RESULT Statuts de Phase: ", result.data);
        const labels = [];
        const values = [];
        const legendUrls = [];
        for (const data of result.data) {
          labels.push(phase === 1 ? translatePhase1(data._id) : phase === 2 ? translatePhase2(data._id) : translate(data._id));
          values.push(data.count);
          legendUrls.push(
            getNewLink(
              {
                base: `/volontaire`,
                filter: filters,
                filtersUrl: [queryString.stringify({ [`statusPhase${phase}`]: encodeURIComponent(data._id) })],
              },
              "session",
            ),
          );
        }
        setGraph({ values, labels, legendUrls });
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("unable to load volontaires statuts de phase data: ", err);
      setError("Erreur: impossible de charger les données.");
    }
  }

  console.log(graph);

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
        <FullDoughnut labels={graph.labels} values={graph.values} legendUrls={graph.legendUrls} legendSide="bottom" maxLegends={2} className="mt-8" tooltipsPercent />
      )}
    </DashboardBox>
  );
}
