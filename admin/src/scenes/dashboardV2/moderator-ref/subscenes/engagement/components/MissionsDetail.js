import React, { useEffect, useState } from "react";
import Loader from "../../../../../../components/Loader";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "../../../../../../services/api";
import { translate } from "snu-lib";
import Tabs from "../../../../../phase0/components/Tabs";
import BarChart from "../../../../components/graphs/BarChart";
import { Legends } from "../../../../components/graphs/graph-commons";

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
        console.log("Mission Details: ", result.data);
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
                title: idx + 1 + ". " + translate(d.key),
                values: [Math.round(d.validatedMission * 100), Math.round(d.youngPreferences * 100)],
                tooltips: [
                  <div key="t-0">
                    <div>{d.missionsCount}</div>
                    <div className="font-normal">missions</div>
                    <div className="mt-2">{Math.round(d.placesLeft * 100)}%</div>
                    <div className="font-normal whitespace-nowrap">de places disponibles</div>
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

  return (
    <DashboardBox title="Détail des missions : préférences vs réalité" className={className}>
      <Tabs selected={selectedTab} tabs={tabs} onChange={setSelectedTab} className="my-6" />
      <div className="flex justify-end my-4">
        <select className="" value={sort} onChange={selectSort}>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <div className="flex justify-center items-center text-center text-sm text-red-600 font-medium p-8">{error}</div>
      ) : loading ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : bars.length === 0 ? (
        <div className="text-gray-500 text-center">Aucune données</div>
      ) : (
        <>
          <div className="flex justify-around items-center mb-8">
            {bars.map((bar) => (
              <BarChart key={bar.title} title={bar.title} values={bar.values} tooltips={bar.tooltips} max={maxValue} unit="%" className="h-[140px]" />
            ))}
          </div>
          <div className="flex justify-center">
            <Legends labels={["Missions validées", "Préférences volontaires"]} />
          </div>
        </>
      )}
    </DashboardBox>
  );
}
