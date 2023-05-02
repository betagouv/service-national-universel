import React, { useEffect, useState } from "react";
import { FullDoughnut } from "../../../../components/graphs";
import Loader from "../../../../../../components/Loader";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { translate } from "snu-lib";

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
          labels.push(translate(data._id));
          values.push(data.count);
          legendUrls.push(`http://localhost:8082/volontaire?STATUS=%5B"VALIDATED"%5D&STATUS_PHASE_${phase}=%5B"${encodeURIComponent(data._id)}"%5D`);
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

  const phaseSelector = (
    <select className="" value={phase} onChange={selectPhase}>
      <option value={1}>Phase 1</option>
      <option value={2}>Phase 2</option>
      <option value={3}>Phase 3</option>
    </select>
  );

  return (
    <DashboardBox title="Statuts de phase" headerChildren={phaseSelector} className={className}>
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : graph === null ? (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <FullDoughnut labels={graph.labels} values={graph.values} legendUrls={graph.legendUrls} legendSide="bottom" maxLegends={2} className="mt-8" tooltipsPercent />
      )}
    </DashboardBox>
  );
}
