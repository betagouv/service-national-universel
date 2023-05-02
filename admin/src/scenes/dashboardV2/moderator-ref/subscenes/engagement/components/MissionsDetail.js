import React, { useEffect, useState } from "react";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { translate } from "snu-lib";
import Tabs from "../../../../../phase0/components/Tabs";
import { BarChart, Legends } from "../../../../components/graphs";
import { computeMissionUrl } from "../../../../components/common";
import { LoadingBar } from "../../../../components/ui/loading";

export default function MissionsDetail({ filters, missionFilters, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("domain");
  const [sort, setSort] = useState("validatedMission");
  const [bars, setBars] = useState([]);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    loadData();
  }, [filters, missionFilters, sort, selectedTab]);

  const tabs = [
    { value: "domain", label: "Domaine" },
    { value: "period", label: "Période" },
    { value: "format", label: "Format" },
  ];

  const sortOptions = [
    { value: "validatedMission", label: "Missions validées" },
    { value: "youngPreferences", label: "Préférences volontaires" },
  ];

  async function loadData() {
    setError(null);
    setLoading(true);
    try {
      const result = await api.post(`/dashboard/engagement/missions-detail`, { filters, missionFilters, sort, group: selectedTab });
      if (result.ok) {
        let maxValue = 0;
        result.data.forEach((d) => {
          if (maxValue < d.validatedMission) {
            maxValue = d.validatedMission;
          }
          if (maxValue < d.youngPreferences) {
            maxValue = d.youngPreferences;
          }
        });

        setBars(
          result.data
            .filter((d) => d.validatedMission >= 0.005 || d.youngPreferences >= 0.005)
            .map((d, idx) => {
              return {
                id: d.key,
                title: idx + 1 + ". " + translate(d.key),
                values: [Math.round(d.validatedMission * 100), Math.round(d.youngPreferences * 100)],
                tooltips: [
                  <div key="t-0">
                    <div>{d.missionsCount}</div>
                    <div className="font-normal">missions</div>
                    <div className="mt-2">{Math.round(d.placesLeft * 100)}%</div>
                    <div className="whitespace-nowrap font-normal">de places disponibles</div>
                  </div>,
                  <div key="t-1">
                    <div>{d.preferencesCount}</div>
                    <div className="font-normal">missions</div>
                  </div>,
                ],
              };
            }),
        );
        setMaxValue(maxValue * 100);
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("unable to load mission details: ", err);
      setError("Erreur: impossible de charger les données.");
    }
    setLoading(false);
  }

  function selectSort(e) {
    setSort(e.target.value);
  }

  function onBarClick(bar) {
    if (selectedTab === "domain") {
      window.open(computeMissionUrl(filters, missionFilters, { DOMAIN: bar.id }), "_blank");
    }
  }

  return (
    <DashboardBox title="Détail des missions : préférences vs réalité" className={className}>
      <Tabs selected={selectedTab} tabs={tabs} onChange={setSelectedTab} className="my-6" />
      <div className="my-4 flex justify-end">
        <select className="" value={sort} onChange={selectSort}>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-around">
          <LoadingBar width="w-[15%]" />
          <LoadingBar width="w-[15%]" />
          <LoadingBar width="w-[15%]" />
          <LoadingBar width="w-[15%]" />
          <LoadingBar width="w-[15%]" />
        </div>
      ) : bars.length === 0 ? (
        <div className="text-center text-gray-500">Aucune données</div>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-around">
            {bars.map((bar) => (
              <BarChart
                key={bar.title}
                title={bar.title}
                values={bar.values}
                tooltips={bar.tooltips}
                max={maxValue}
                unit="%"
                className="h-[140px]"
                onClick={() => onBarClick(bar)}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <Legends labels={["Missions validées", "Préférences volontaires"]} noValue />
          </div>
        </>
      )}
    </DashboardBox>
  );
}
