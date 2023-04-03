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
        console.log("RESULT: ", result.data);
        const labels = [];
        const values = [];
        for (const data of result.data) {
          labels.push(translate(data._id));
          values.push(data.count);
        }
        setGraph({ values, labels });
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données 2.");
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
        <div className="flex justify-center items-center text-center text-sm text-red-600 font-medium p-8">{error}</div>
      ) : graph === null ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <FullDoughnut labels={graph.labels} values={graph.values} legendSide="bottom" maxLegends={2} className="mt-8" />
      )}
    </DashboardBox>
  );
}
