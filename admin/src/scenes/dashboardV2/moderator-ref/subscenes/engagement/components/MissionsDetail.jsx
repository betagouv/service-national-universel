import { getNewLink } from "@/utils";
import queryString from "query-string";
import { useEffect, useState } from "react";
import { translate } from "snu-lib";
import api from "../../../../../../services/api";
import Tabs from "../../../../../phase0/components/Tabs";
import { BarChart, graphColors } from "../../../../components/graphs";
import DashboardBox from "../../../../components/ui/DashboardBox";
import { LoadingBar } from "../../../../components/ui/loading";
import React from "react";
import { MdInfoOutline } from "react-icons/md";
import ReactTooltip from "react-tooltip";
import MoreInfoPanel from "@/scenes/dashboardV2/components/ui/MoreInformationPanel";
import InformationCircle from "@/assets/icons/InformationCircle";

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
      window.open(
        getNewLink({
          base: `/mission`,
          filter: filters,
          filtersUrl: [queryString.stringify({ mainDomain: bar.id })],
        }),
        "_blank",
      );
    }
  }

  return (
    <DashboardBox title="Détail des missions : préférences vs réalité" className={className}>
      <Tabs selected={selectedTab} tabs={tabs} onChange={setSelectedTab} className="my-6" />
      <div className="my-4 flex justify-end items-center">
        <p>Trier par : </p>
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
                className="h-[140px] cursor-pointer"
                onClick={() => onBarClick(bar)}
              />
            ))}
          </div>
          <div className="flex justify-center gap-4">
            <div className="flex flex-row-reverse items-center gap-2">
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-600">Missions validées</p>
                <InformationCircle data-tip data-for="mission" className="cursor-pointer text-gray-400" />
                <ReactTooltip id="mission" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md " tooltipRadius="6">
                  <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Mission existante sur la plateforme avec le statut validé.</p>
                </ReactTooltip>
              </div>
              <div className={`flex items-center`}>
                <div className={`h-[10px] w-[10px] rounded-full`} style={{ backgroundColor: graphColors[2][0] }}></div>
              </div>
            </div>
            <div className="flex flex-row-reverse items-center gap-2">
              <div className="text-xs text-gray-600">Préférences volontaires</div>
              <div className={`flex items-center`}>
                <div className={`h-[10px] w-[10px] rounded-full`} style={{ backgroundColor: graphColors[2][1] }}></div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardBox>
  );
}
