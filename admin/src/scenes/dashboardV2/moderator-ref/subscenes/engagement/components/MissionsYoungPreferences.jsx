import React, { useEffect, useState } from "react";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { translate } from "snu-lib";
import Tabs from "../../../../../phase0/components/Tabs";
import { FullDoughnut } from "../../../../components/graphs";
import { LoadingDoughnut } from "../../../../components/ui/loading";

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
        setGraphs(
          result.data.map((res) => {
            const labels = [];
            const values = [];
            const tooltips = [];
            const infoPanels = [];
            const total = res.reduce((acc, val) => acc + val.count, 0);
            for (let i = 0, n = res.length; i < n; ++i) {
              const data = res[i];
              labels.push(translate(data._id));
              values.push(total ? Math.round((data.count / total) * 100) : 0);
              tooltips.push(
                <div>
                  <span className="font-normal">D&apos;après </span>
                  {data.count}
                  <span className="font-normal"> volontaires</span>
                </div>,
              );
              if (data.extra) {
                const extraTotal = data.extra.reduce((acc, val) => acc + val.count, 0);
                const extraTooltips = data.extra.map((e, idx) => (
                  <div key={"extratooltip-" + idx}>
                    <span className="font-normal">D&apos;après </span>
                    {e.count}
                    <span className="font-normal"> volontaires</span>
                  </div>
                ));
                infoPanels.push(
                  <div key={`info-${i}`} className="p-8">
                    <div className="test-base font-bold text-gray-800">{translate(data._id)}</div>
                    <FullDoughnut
                      labels={data.extra.map((e) => (e._id !== "" ? translate(e._id) : "Non précisé"))}
                      values={data.extra.map((e) => (extraTotal ? Math.round((e.count / extraTotal) * 100) : 0))}
                      tooltips={extraTooltips}
                      legendSide="right"
                      maxLegends={4}
                      valueSuffix="%"
                    />
                  </div>,
                );
              } else {
                infoPanels.push(null);
              }
            }
            return { values, labels, tooltips, infoPanels };
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
    <DashboardBox title="Selon les préférences volontaires" className={`grow ${className}`} childrenClassName="grow">
      <Tabs selected={selectedTab} tabs={tabs} onChange={setSelectedTab} className="my-6" />
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center">
          <LoadingDoughnut />
        </div>
      ) : graphs.length === 0 ? (
        <div className="text-center text-gray-500">Aucune données</div>
      ) : (
        <div className="mt-8 flex items-center justify-around">
          {graphs.map((graph, idx) => (
            <FullDoughnut
              title={getGraphTitle(idx)}
              key={"graph-" + idx}
              labels={graph.labels}
              values={graph.values}
              valueSuffix="%"
              legendSide="right"
              maxLegends={3}
              tooltips={graph.tooltips}
              legendInfoPanels={graph.infoPanels}
            />
          ))}
        </div>
      )}
    </DashboardBox>
  );
}
