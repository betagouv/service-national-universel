import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { HiUsers } from "react-icons/hi";
import { FaMagnifyingGlass } from "react-icons/fa6";

import { formatCohortPeriod } from "snu-lib";
import { Select } from "@snu/ds/admin";


export default function SelectCohort({ cohort, filterFn, onChange, disabled }) {

  const cohorts = useSelector((state) => state.Cohorts);

  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);

  const options = useMemo(() => {
    let updatedCohorts = cohorts || [];
    if (filterFn) {
      updatedCohorts = updatedCohorts.filter(filterFn);
    }
    return updatedCohorts.map((cohort) => ({
      value: cohort.name,
      label: (
        <div className="flex gap-2.5 py-2.5 ml-2">
          <HiUsers size={24} className="mt-0.5" color={cohort.name.includes("CLE") ? "#EC4899" : "#6366F1"} />
          <p className="font-normal text-base">
            <span className="text-gray-500 font-normal"> {formatCohortPeriod(cohort, "short")}</span> <span className="text-gray-700 font-medium">{cohort.name + " "} </span>
          </p>
        </div>
      ),
    }));
  }, [cohorts, filterFn]);

  const currentCohortName = cohort ?? options?.[0]?.value;

  return (
    <>
      {isSelectMenuOpen && <FaMagnifyingGlass size={25} className="text-gray-400 mr-3" />}
      <Select
        options={options}
        value={options.find(({ value }) => value == currentCohortName)}
        defaultValue={currentCohortName}
        maxMenuHeight={520}
        className="w-[500px]"
        onChange={(e) => onChange(e.value)}
        closeMenuOnSelect
        onMenuOpen={() => setIsSelectMenuOpen(true)}
        onMenuClose={() => setIsSelectMenuOpen(false)}
        disabled={disabled}
      />
    </>
  );
}
