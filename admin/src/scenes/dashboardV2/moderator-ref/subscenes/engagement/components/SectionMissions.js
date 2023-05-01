import Section from "../../../../components/ui/Section";
import React, { useState, useEffect } from "react";
import { FilterComponent } from "../../../../components/FilterDashBoard";
import MissionsProposedPlaces from "./MissionsProposedPlaces";
import MissionsStatuts from "./MissionsStatuts";
import MissionsDetail from "./MissionsDetail";
import MissionsYoungPreferences from "./MissionsYoungPreferences";
import DatePicker from "react-datepicker";

export default function SectionMissions({ filters }) {
  const [missionFiltersArray, setMissionFiltersArray] = useState([]);
  const [missionFilters, setMissionFilters] = useState(null);
  const [selectedMissionFilters, setSelectedMissionFilters] = useState({ start: null, end: null, sources: [] });

  useEffect(() => {
    prepareMissionFilters();
  }, [filters]);

  useEffect(() => {
    if (missionFiltersArray.length > 0) {
      setMissionFilters(
        <div className="flex items-center gap-2">
          {missionFiltersArray.map((filter) => {
            if (filter.id === "sources") {
              return <FilterComponent key={filter.id} filter={filter} selectedFilters={selectedMissionFilters} setSelectedFilters={setSelectedMissionFilters} />;
            } else {
              return <DateFilterComponent key={filter.id} filter={filter} selectedFilters={selectedMissionFilters} setSelectedFilters={setSelectedMissionFilters} />;
            }
          })}
        </div>,
      );
    } else {
      setMissionFilters(null);
      setSelectedMissionFilters({ start: null, end: null, sources: [] });
    }
  }, [missionFiltersArray, selectedMissionFilters]);

  async function prepareMissionFilters() {
    const filtersArray = [
      {
        id: "start",
        name: "Date de début",
      },
      {
        id: "end",
        name: "Date de fin",
      },
      {
        id: "sources",
        name: "Source",
        fullValue: "Toutes",
        options: [
          { key: "SNU", label: "SNU" },
          { key: "JVA", label: "JVA" },
        ],
      },
    ];
    setMissionFiltersArray(filtersArray);
  }

  return (
    <Section title="Missions" headerChildren={missionFilters}>
      <div className="flex">
        <MissionsProposedPlaces filters={filters} missionFilters={selectedMissionFilters} className="mr-4" />
        <MissionsStatuts filters={filters} missionFilters={selectedMissionFilters} className="grow" />
      </div>
      <MissionsDetail filters={filters} missionFilters={selectedMissionFilters} />
      <MissionsYoungPreferences filters={filters} missionFilters={selectedMissionFilters} />
    </Section>
  );
}

const DateFilterComponent = ({ filter, selectedFilters, setSelectedFilters }) => {
  const selectedFilterValue = selectedFilters[filter.id];
  const [visible, setVisible] = React.useState(false);

  function onChange(value) {
    setSelectedFilters({ ...selectedFilters, [filter.id]: value });
  }

  return (
    <div className="relative w-fit">
      <div className={`border-[2px] p-0.5 ${visible ? "rounded-xl border-blue-600" : "border-transparent"}`}>
        <div className="flex cursor-pointer flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 bg-[#FFFFFF] p-2 hover:border-gray-300">
          <div className="text-xs font-medium text-gray-700">{filter.name}</div>
          <div className="w-[80px] rounded bg-gray-100 py-1 px-2 text-xs text-gray-500">
            <DatePicker
              locale="fr"
              selected={selectedFilterValue}
              onChange={onChange}
              placeholderText={filter.noValue ? filter.noValue : "Choisir"}
              className="w-full bg-[transparent]"
              dateFormat="dd/MM/yyyy"
              onCalendarOpen={() => setVisible(true)}
              onCalendarClose={() => setVisible(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
