import { buildQuery } from "@/components/filters-system-v2/components/filters/utils";
import { TreeFilter } from "@/components/filters-system-v2/tree-filter/TreeFilter";
import { mapAvailableFiltersToTreeFilter } from "@/components/filters-system-v2/tree-filter/TreeFilterService";
import useFilterLabels from "@/scenes/volontaires/useFilterLabels";
import { getFilterArray } from "@/scenes/volontaires/utils";
import { getCohortGroups } from "@/services/cohort.service";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSetState } from "react-use";
import ListeDiffusionFilterWrapper from "../planMarketing/campagne/liste-diffusion-temp/ListeDiffusionFilterWrapper";
import { TreeFilterWithoutHeadlessUi } from "@/components/filters-system-v2/tree-filter/TreeFilterWithoutHeadlessUi";

export interface TempState {
  params: {
    count?: number;
    page: number;
    sort: {
      label: string;
      field: string;
      order: string;
    };
    filters: TempFilters;
  };
  filters: TempFilters;
}

export type TempFilters = Record<string, { key: string }[]>;
export default function TreeFilterExample({ type }: { type: string }) {
  const pageId = "liste-diffusion-filter";

  let route = "/elasticsearch/young/search";
  if (type === "volontaire") {
    route = "/elasticsearch/young/search?tab=volontaire";
  }
  const [data, setData] = useSetState<TempState>({
    params: {
      page: 0,
      sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
      filters: {},
    },
    filters: {},
  });

  const [firstLoad, setFirstLoad] = useState(true);

  const { data: labels } = useFilterLabels(pageId);

  const user = useSelector((state) => state.Auth.user);
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
  const getDefaultFilters = () => {
    const newFilters = {};
    filters.forEach((filter) => {
      newFilters[filter?.name || ""] = { filter: filter?.defaultValue ? filter.defaultValue : [] };
    });
    return newFilters;
  };
  useEffect(() => {
    const selectedFilters = getDefaultFilters();

    buildQuery(route, selectedFilters, 0, filters, { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" }, 10).then((res) => {
      if (!res) return;
      setData({ filters: { ...data.filters, ...res.newFilters } });
      const newParamData: {
        count: number;
        filters: TempFilters;
        page?: number;
      } = {
        count: res.count,
        filters: { ...data.filters, ...res.newFilters },
      };
      //@ts-expect-error not exist
      setData({ params: { ...data.params, ...newParamData } });
      if (firstLoad) setFirstLoad(false);
    });
  }, []);

  const tempDecoupledFilterData = mapAvailableFiltersToTreeFilter(data.filters, getCohortGroups());
  return (
    <>
      {/* <ListeDiffusionFilterWrapper type="volontaire" paramData={data.params} dataFilter={data.filters} id="a" /> */}
      {/* <ListeDiffusionFilterWrapper type="autre" paramData={data.params} dataFilter={data.filters} id="b" /> */}
      {/* <ListeDiffusionFilterWrapper type="volontaire" paramData={data.params} dataFilter={data.filters} id="c" /> */}
      <TreeFilter treeFilter={tempDecoupledFilterData} id={"a"} />
      {/* <TreeFilter treeFilter={tempDecoupledFilterData} id={"b"} />
      <TreeFilter treeFilter={tempDecoupledFilterData} id={"c"} />
      <TreeFilter treeFilter={tempDecoupledFilterData} id={"d"} /> */}
      <TreeFilterWithoutHeadlessUi treeFilter={tempDecoupledFilterData} id={"a-2"} />
    </>
  );
}
