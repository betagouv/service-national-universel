import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { HiUsers } from "react-icons/hi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import cx from "classnames";

import { formatCohortPeriod } from "snu-lib";
import { Select, BadgeNotif } from "@snu/ds/admin";
import { CohortState } from "@/redux/cohorts/reducer";

interface Props {
  cohort: string;
  sort?: string;
  withBadge?: boolean;
  className?: string;
  filterFn?: (cohort: CohortState["Cohorts"][0]) => boolean;
  onChange?: (cohortName: string) => void;
}

export default function SelectCohort({ cohort, withBadge, sort, filterFn, onChange, className }: Props) {
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);

  const options = useMemo(() => {
    let updatedCohorts = cohorts || [];
    if (filterFn) {
      updatedCohorts = updatedCohorts.filter(filterFn);
    }
    if (sort) {
      updatedCohorts = updatedCohorts.sort((a, b) => new Date(b[sort]).getTime() - new Date(a[sort]).getTime());
    }
    return updatedCohorts.map((cohort) => ({
      value: cohort.name,
      label: (
        <div className="flex flex-nowrap items-center justify-start gap-1.5 p-2.5 w-full">
          <HiUsers size={24} className="mt-0.5 mr-1 min-w-[24px]" color={cohort.name.includes("CLE") ? "#EC4899" : "#6366F1"} />
          <span className="text-gray-500 font-medium whitespace-nowrap">{formatCohortPeriod(cohort, "short")}</span>
          <span className="text-gray-900 font-bold text-ellipsis overflow-hidden whitespace-nowrap">{`${cohort.name} `}</span>
        </div>
      ),
    }));
  }, [cohorts, filterFn, sort]);

  const currentCohortName = cohort ?? options?.[0]?.value;

  return (
    <div className={cx("flex justify-end items-center", className)}>
      {isSelectMenuOpen && <FaMagnifyingGlass size={25} className="text-gray-400 mr-3" />}
      <Select
        options={options}
        value={options.find(({ value }) => value == currentCohortName)}
        defaultValue={currentCohortName}
        maxMenuHeight={520}
        className="w-[450px] max-w-[450px]"
        controlCustomStyle={{
          border: "none",
          boxShadow: "0px 0px 8px 0px rgba(0, 0, 0, 0.08)",
          "&:hover": {
            border: "none",
          },
        }}
        menuCustomStyle={{
          border: "none",
          "&:hover": {
            border: "none",
          },
        }}
        optionCustomStyle={{ paddingTop: 3, paddingBottom: 3 }}
        onChange={(e) => onChange(e.value)}
        closeMenuOnSelect
        onMenuOpen={() => setIsSelectMenuOpen(true)}
        onMenuClose={() => setIsSelectMenuOpen(false)}
        badge={withBadge && <BadgeNotif count={options.length} />}
      />
    </div>
  );
}
