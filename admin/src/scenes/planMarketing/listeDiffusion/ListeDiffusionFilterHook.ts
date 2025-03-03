import { buildQuery } from "@/components/filters-system-v2/components/filters/utils";
import { TempState, TempFilters } from "@/scenes/develop/TreeFilterExample";
import useFilterLabels from "@/scenes/volontaires/useFilterLabels";
import { getFilterArray } from "@/scenes/volontaires/utils";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSetState } from "react-use";

export const useListeDiffusionFilter = (listeType: string, routeSearch: string) => {
  const [data, setData] = useSetState<TempState>({
    params: {
      page: 0,
      sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
      filters: {},
    },
    filters: {},
  });

  const { data: labels, isPending } = useFilterLabels(listeType);

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
  // const getDefaultFilters = () => {
  //   const newFilters = {};
  //   filters.forEach((filter) => {
  //     newFilters[filter?.name || ""] = { filter: filter?.defaultValue ? filter.defaultValue : [] };
  //   });
  //   return newFilters;
  // };

  useEffect(() => {
    // const selectedFilters = getDefaultFilters();
    buildQuery(routeSearch, {}, 0, filters, { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" }, 10).then((res) => {
      if (!res) return;
      const newParamData: {
        count: number;
        filters: TempFilters;
        page?: number;
      } = {
        count: res.count,
        filters: { ...res.newFilters },
      };
      console.log(listeType + "-...res.newFilters", res.newFilters);

      //@ts-expect-error not exist
      setData({ params: { ...newParamData }, filters: { ...res.newFilters } });
    });
  }, []);

  return { data, filters, isPending };
};
