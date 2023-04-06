import Section from "../../../../components/ui/Section";
import React, { useState, useEffect } from "react";
import { FilterComponent } from "../../../../components/FilterDashBoard";
import api from "../../../../../../services/api";
import MissionsProposedPlaces from "./MissionsProposedPlaces";
import MissionsStatuts from "./MissionsStatuts";
import MissionsDetail from "./MissionsDetail";
import MissionsYoungPreferences from "./MissionsYoungPreferences";

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
          {missionFiltersArray.map((filter) => (
            <FilterComponent key={filter.id} filter={filter} selectedFilters={selectedMissionFilters} setSelectedFilters={setSelectedMissionFilters} />
          ))}
        </div>,
      );
    } else {
      setMissionFilters(null);
      setSelectedMissionFilters({ start: null, end: null, sources: [] });
    }
  }, [missionFiltersArray]);

  async function prepareMissionFilters() {
    try {
      const result = await api.post(`/dashboard/engagement/mission-sources`, { filters });
      if (result.ok) {
        const filtersArray = [
          {
            id: "start",
            name: "Date de début",
            fullValue: "Aujourd'hui",
            options: [],
          },
          {
            id: "end",
            name: "Date de fin",
            fullValue: "Aujourd'hui",
            options: [],
          },
          {
            id: "sources",
            name: "Source",
            fullValue: "Toutes",
            options: result.data.map((source) => ({ key: source._id, label: source.name })),
          },
        ];
        console.log("Mission Filters Array: ", filtersArray);
        setMissionFiltersArray(filtersArray);
      } else {
        console.log("Error: unable to load sources names");
        setMissionFiltersArray([]);
      }
    } catch (err) {
      console.log("Error: ", err);
      setMissionFiltersArray([]);
    }
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
