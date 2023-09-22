import Section from "../../../../components/ui/Section";
import React, { useState, useEffect, Fragment } from "react";
import { FilterComponent } from "../../../../components/FilterDashBoard";
import MissionsProposedPlaces from "./MissionsProposedPlaces";
import MissionsStatuts from "./MissionsStatuts";
import MissionsDetail from "./MissionsDetail";
import MissionsYoungPreferences from "./MissionsYoungPreferences";
import DatePicker from "../../../../../../components/ui/forms/DatePicker";
import dayjs from "@/utils/dayjs.utils";
import { Popover, Transition } from "@headlessui/react";

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
  const formattedDate = selectedFilterValue ? dayjs(selectedFilterValue).format("DD/MM/YYYY") : "Choisir";

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className={`${open ? "rounded-xl border-blue-600" : "outline-none"} border-[2px] p-0.5 border-transparent`}>
            <div className="flex cursor-pointer flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 bg-[#FFFFFF] p-2 hover:border-gray-300">
              <div className="text-xs font-medium text-gray-700">{filter.name}</div>
              <div className="w-[80px] rounded bg-gray-100 py-1 px-2 text-xs text-gray-500">{formattedDate}</div>
            </div>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1">
            <Popover.Panel className="absolute right-0 z-10 mt-2 flex w-screen max-w-min">
              <div className="rounded-lg bg-white shadow-lg ">
                <div className="flex flex-auto rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 ">
                  <DatePicker
                    fromYear={2022}
                    toYear={2023}
                    onChange={(date) => {
                      setSelectedFilters({ ...selectedFilters, [filter.id]: date });
                    }}
                  />
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
