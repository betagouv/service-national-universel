import { buildQuery } from "@/components/filters-system-v2/components/filters/utils";
import { RootDecoupledFilter } from "@/components/filters-system-v2/decoupled-filter/DecoupledFilter";
import { mapAvailableFiltersToTreeFilter } from "@/components/filters-system-v2/decoupled-filter/DecoupledFilterService";
import useFilterLabels from "@/scenes/volontaires/useFilterLabels";
import { getFilterArray } from "@/scenes/volontaires/utils";
import { getCohortGroups } from "@/services/cohort.service";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSetState } from "react-use";
import ListeDiffusionFilterWrapper from "./ListeDiffusionFilterWrapper";

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
export default function TempComponent({ type }: { type: string }) {
  const pageId = "liste-diffusion-filter";

  let route = "/elasticsearch/young/search";
  if (type === "volontaire") {
    route = "/elasticsearch/young/search?tab=volontaire";
  }
  // const [paramData, setParamData] = useState({
  //   page: 0,
  //   sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
  // });
  // const [dataFilter, setDataFilter] = useState({});
  const [data, setData] = useSetState<TempState>({
    params: {
      page: 0,
      sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
      filters: {},
    },
    filters: {},
  });

  const [firstLoad, setFirstLoad] = useState(true);

  const { data: labels, isPending, isError } = useFilterLabels(pageId);

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
    filters.map((f) => {
      //@ts-expect-error unknown
      //   if (f?.customComponent?.getQuery) {
      //     newFilters[f?.name || ""] = { filter: f.defaultValue, customComponentQuery: f.getQuery?.(f.defaultValue) };
      //   } else {
      newFilters[f?.name || ""] = { filter: f?.defaultValue ? f.defaultValue : [] };
      //   }
    });
    return newFilters;
  };
  useEffect(() => {
    const selectedFilters = getDefaultFilters();

    buildQuery(route, selectedFilters, 0, filters, { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" }, 10).then((res) => {
      if (!res) return;
      //   setTotal(res.count);
      // setDataFilter({ ...dataFilter, ...res.newFilters });
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
      // if (paramData.count !== res.count && !firstLoad) newParamData.page = 0;
      setData({ params: { ...data.params, ...newParamData } });
      // setParamData((paramData) => ({ ...paramData, ...newParamData }));
      //   setData(res.data);
      if (firstLoad) setFirstLoad(false);

      // Hack: avoid unwanted refresh: https://stackoverflow.com/a/61596862/978690
      //   const search = `?${currentFilterAsUrl(selectedFilters, paramData?.page, filters, undefined)}`;
      //   const { pathname } = history.location;
      //   if (location.search !== search) window.history.replaceState({ path: pathname + search }, "", pathname + search);
    });
  }, []);
  // console.log("TempComponent - dataFilter", data.filters);
  // console.log("TempComponent - paramData", data.params);
  const tempDecoupledFilterData = mapAvailableFiltersToTreeFilter(data.filters, getCohortGroups());
  // console.log("TempComponent - tempDecoupledFilterData", tempDecoupledFilterData);
  return (
    <>
      <ListeDiffusionFilterWrapper type="volontaire" paramData={data.params} dataFilter={data.filters} id="a" />
      <ListeDiffusionFilterWrapper type="autre" paramData={data.params} dataFilter={data.filters} id="b" />
      <ListeDiffusionFilterWrapper type="volontaire" paramData={data.params} dataFilter={data.filters} id="c" />
      <RootDecoupledFilter filterTree={tempDecoupledFilterData} id={"a"} />
      <RootDecoupledFilter filterTree={tempDecoupledFilterData} id={"b"} />
      <RootDecoupledFilter filterTree={tempDecoupledFilterData} id={"c"} />
      <RootDecoupledFilter filterTree={tempDecoupledFilterData} id={"d"} />
    </>
  );
}
