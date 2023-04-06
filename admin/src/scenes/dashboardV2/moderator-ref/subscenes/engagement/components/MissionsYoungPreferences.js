import React, { useEffect, useState } from "react";
import Loader from "../../../../../../components/Loader";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { translate } from "snu-lib";
import Tabs from "../../../../../phase0/components/Tabs";
import BarChart from "../../../../components/graphs/BarChart";
import { Legends } from "../../../../components/graphs/graph-commons";
import {FullDoughnut} from "../../../../components/graphs";

export default function MissionsYoungPreferences({ filters, missionFilters, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("project");
  const [graphs, setGraphs] = useState([]);

  useEffect(() => {
    loadData();
  }, [filters, missionFilters, selectedTab]);

  const tabs = [
    { value: "project", label: "Projet professionnel" },
    { value: "geography", label: "Mobilités géographiques" },
    { value: "volunteer", label: "Engagement parallèle comme bénévole" },
  ];

  async function loadData() {
    setError(null);
    setLoading(true);
    try {
      const result = await api.post(`/dashboard/engagement/missions-young-preferences`, { filters, missionFilters, group: selectedTab });
      if (result.ok) {
        console.log("Mission Young Preferences: ", result.data);
        setGraphs(
          result.data.map((res) => {
            const labels = [];
            const values = [];
            for (const data of res) {
              labels.push(translate(data._id));
              values.push(data.count);
            }
            return { values, labels };
          }),
        );
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("unable to load mission young preferences: ", err);
      setError("Erreur: impossible de charger les données.");
    }
    setLoading(false);
  }

  function getGraphTitle(index) {
    if (selectedTab === "geography") {
      return index === 0 ? "Mission à proximité" : "Moyen de transport privilégié";
    }
    return null;
  }

  return (
    <DashboardBox title="Selon les préférences volontaires" className={className}>
      <Tabs selected={selectedTab} tabs={tabs} onChange={setSelectedTab} className="my-6" />
      {error ? (
        <div className="flex justify-center items-center text-center text-sm text-red-600 font-medium p-8">{error}</div>
      ) : loading ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : graphs.length === 0 ? (
        <div className="text-gray-500 text-center">Aucune données</div>
      ) : (
        <div className="flex items-center justify-around mt-8">
          {graphs.map((graph, idx) => (
            <FullDoughnut title={getGraphTitle(idx)} key={"graph-" + idx} labels={graph.labels} values={graph.values} legendSide="right" maxLegends={3} />
          ))}
        </div>
      )}
    </DashboardBox>
  );
}
