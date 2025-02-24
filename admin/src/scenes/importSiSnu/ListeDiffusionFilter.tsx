import { Filters, SelectedFilters } from "@/components/filters-system-v2";
import { getCohortGroups } from "@/services/cohort.service";
import React, { useState } from "react";
import { getFilterArray } from "../volontaires/utils";

import Loader from "@/components/Loader";
import { useSelector } from "react-redux";
import useFilterLabels from "../volontaires/useFilterLabels";

export interface ListeDiffusionFilterProps {
  type: string;
}
export default function ListeDiffusionFilter({ type }: ListeDiffusionFilterProps) {
  const pageId = "liste-diffusion-filter";
  const user = useSelector((state) => state.Auth.user);
  const { data: labels, isPending, isError } = useFilterLabels(pageId);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
    sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
  });
  const size = 10;
  if (isPending) return <Loader />;
  const filters = [
    ...getFilterArray(user, labels).map((filter) => {
      if (filter?.name === "status") {
        return {
          ...filter,
          defaultValue: [],
        };
      }
      return filter;
    }),
  ];
  let route = "/elasticsearch/young/search";
  if (type === "volontaire") {
    route = "/elasticsearch/young/search?tab=volontaire";
  }

  return (
    <div className="flex flex-col bg-white shadow-md p-6 m-6">
      <div className="flex">
        <div className="flex text-xl pr-2">Filtres</div>
        <Filters
          pageId={pageId}
          route={route}
          setData={() => {}}
          filters={filters}
          searchPlaceholder="Rechercher par prénom, nom, email, code postal..."
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          paramData={paramData}
          setParamData={setParamData}
          size={size}
          intermediateFilters={[getCohortGroups()]}
          showInput={false}
        />
      </div>
      <div className="mt-2 flex flex-row flex-wrap items-center">
        <SelectedFilters filterArray={filters} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
      </div>
    </div>
  );
}
