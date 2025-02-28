import { buildQuery } from "@/components/filters-system-v2/components/filters/utils";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSetState } from "react-use";
import useFilterLabels from "../volontaires/useFilterLabels";
import { getFilterArray } from "../volontaires/utils";
import { TempState, TempFilters } from "./TreeFilterExample";

export const useListeDiffusion = (listeType: string, routeSearch: string) => {
  const [data, setData] = useSetState<TempState>({
    params: {
      page: 0,
      sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
      filters: {},
    },
    filters: {},
  });

  const [firstLoad, setFirstLoad] = useState(true);

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
  const getDefaultFilters = () => {
    const newFilters = {};
    filters.forEach((filter) => {
      newFilters[filter?.name || ""] = { filter: filter?.defaultValue ? filter.defaultValue : [] };
    });
    return newFilters;
  };

  useEffect(() => {
    const selectedFilters = getDefaultFilters();
    buildQuery(routeSearch, selectedFilters, 0, filters, { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" }, 10).then((res) => {
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

  return { data, filters, isPending };
};
