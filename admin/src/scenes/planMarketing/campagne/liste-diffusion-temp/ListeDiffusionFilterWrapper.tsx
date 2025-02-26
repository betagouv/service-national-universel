import { SelectedFilters } from "@/components/filters-system-v2";
import { getCohortGroups } from "@/services/cohort.service";
import React, { createContext, useState } from "react";

import Loader from "@/components/Loader";
import { useSelector } from "react-redux";
import ListeDiffusionFilters from "./ListeDiffusionFilters";
import useFilterLabels from "@/scenes/volontaires/useFilterLabels";
import { getFilterArray } from "@/scenes/volontaires/utils";

export interface ListeDiffusionFilterProps {
  type: string;
  paramData: any;
  dataFilter: any;
  id: string;
}

export interface ListeDiffusionFilterContextProps {
  keyPrefix: string;
}
export const ListeDiffusionFilterContext: React.Context<ListeDiffusionFilterContextProps> = createContext({ keyPrefix: "" });

export default function ListeDiffusionFilterWrapper({ type, paramData, dataFilter, id }: ListeDiffusionFilterProps) {
  // const [listeDiffusionFilter, setListeDiffusionFilter] = useState<ListeDiffusionFilterContextProps>({ keyPrefix: id });

  // console.log("ListeDiffusionFilterWrapper", dataFilter);
  const pageId = "liste-diffusion-filter";
  const user = useSelector((state) => state.Auth.user);
  const { data: labels, isPending, isError } = useFilterLabels(pageId);
  const [selectedFilters, setSelectedFilters] = useState({});
  const onParamDataChange = () => {
    //
  };
  // structuredClone();
  const handleFilterChange = (filter: any) => {
    setSelectedFilters(filter);
  };
  // const [selectedFilters, setSelectedFilters] = useState({});
  // const [paramData, setParamData] = useState({
  //   page: 0,
  //   sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
  // });
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
    <ListeDiffusionFilterContext.Provider value={{ keyPrefix: id }}>
      <div className="flex flex-col bg-white shadow-md p-6 m-6">
        <div className="flex">
          <div className="flex text-xl pr-2">Filtres</div>
          <ListeDiffusionFilters
            filters={filters}
            selectedFilters={selectedFilters}
            onSelectFilters={handleFilterChange}
            // paramData={paramData}
            // setParamData={setParamData}
            intermediateFilters={[getCohortGroups()]}
            dataFilter={dataFilter}
          />
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center">
          <SelectedFilters filterArray={filters} selectedFilters={selectedFilters} setSelectedFilters={handleFilterChange} paramData={paramData} setParamData={onParamDataChange} />
        </div>
      </div>
    </ListeDiffusionFilterContext.Provider>
  );
}
