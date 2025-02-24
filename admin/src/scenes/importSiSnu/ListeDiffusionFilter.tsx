import { Filters } from "@/components/filters-system-v2";
import { getCohortGroups } from "@/services/cohort.service";
import React, { useState } from "react";
import { getFilterArray } from "../volontaires/utils";

import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import useFilterLabels from "../volontaires/useFilterLabels";

export default function ListeDiffusionFilter() {
  const pageId = "liste-diffusion-filter";
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const { data: labels, isPending, isError } = useFilterLabels(pageId);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [data, setData] = useState([]);
  const [paramData, setParamData] = useState({
    page: 0,
    sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
  });
  const [size, setSize] = useState(10);

  const filterArray = getFilterArray(user, labels);
  //   console.log("filterArray", filterArray);
  //   console.log("selectedFilters", selectedFilters);
  //   console.log("paramData", paramData);
  //   console.log("size", size);
  return (
    <div className="bg-white shadow-md p-6 m-6">
      <Filters
        pageId={"liste-diffusion"}
        route="/elasticsearch/young/search?tab=volontaire"
        setData={() => setData([])}
        filters={filterArray}
        searchPlaceholder="Rechercher par prénom, nom, email, code postal..."
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        paramData={paramData}
        setParamData={setParamData}
        size={size}
        intermediateFilters={[getCohortGroups()]}
        isInput={false}
      />
    </div>
  );
}
