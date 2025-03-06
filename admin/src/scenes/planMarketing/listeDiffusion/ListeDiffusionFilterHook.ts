import { Filter } from "@/components/filters-system-v2/components/Filters";
import { buildQuery } from "@/components/filters-system-v2/components/filters/utils";
import { TempState } from "@/scenes/develop/TreeFilterExample";
import { getInscriptionFilterArray } from "@/scenes/inscription";
import useFilterLabels from "@/scenes/volontaires/useFilterLabels";
import { getFilterArray } from "@/scenes/volontaires/utils";
import { set } from "mongoose";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSetState } from "react-use";

// Legacy code
export const useListeDiffusionFilter = () => {
  const [dataVolontaires, setDataVolontaires] = useSetState({
    params: {
      page: 0,
      sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
      filters: {},
    },
    filters: {},
  });
  const [dataInscriptions, setDataInscriptions] = useSetState({
    params: {
      page: 0,
      sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
      filters: {},
    },
    filters: {},
  });
  const [filtersVolontaires, setFiltersVolontaires] = useState([]);
  const [filtersInscriptions, setFiltersInscriptions] = useState([]);

  const { data: labelsVolontaires, isPending: isPendingVolontaires } = useFilterLabels("young-list");
  const { data: labelsInscriptions, isPending: isPendingInscriptions } = useFilterLabels("inscription-list");
  const user = useSelector((state) => state.Auth.user);
  const [isPending, setIsPending] = useState(true);
  const [isPendingQueryInscriptions, setIsPendingQueryInscriptions] = useState(true);

  useEffect(() => {
    if (!labelsVolontaires) return;
    const newFilters = getFilterArray(user, labelsVolontaires)
      .filter((filter) => filter?.name !== "cohort")
      .map((filter) => {
        if (filter?.name === "status") {
          return { ...filter, defaultValue: [] };
        }
        return filter;
      }) as any;
    setFiltersVolontaires(newFilters);
  }, [labelsVolontaires, user]);

  useEffect(() => {
    if (!labelsInscriptions) return;
    const newFilters = getInscriptionFilterArray(user, labelsInscriptions).filter((filter) => filter?.name !== "cohort") as any;
    setFiltersInscriptions(newFilters);
  }, [labelsInscriptions, user]);

  useEffect(() => {
    if (filtersVolontaires?.length === 0) return;
    buildQuery("/elasticsearch/young/search?tab=volontaire", {}, 0, filtersVolontaires, { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" }, 10).then((res) => {
      if (!res) return;
      const newParamData = {
        count: res.count,
        filters: { ...res.newFilters },
      };
      setIsPending(false);
      setDataVolontaires({ params: { ...newParamData }, filters: { ...res.newFilters } });
    });
  }, [filtersVolontaires]);

  useEffect(() => {
    if (filtersInscriptions?.length === 0) return;
    buildQuery("/elasticsearch/young/search", {}, 0, filtersInscriptions, { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" }, 10).then((res) => {
      if (!res) return;
      const newParamData = {
        count: res.count,
        filters: { ...res.newFilters },
      };
      setIsPendingQueryInscriptions(false);

      setDataInscriptions({ params: { ...newParamData }, filters: { ...res.newFilters } });
    });
  }, [filtersInscriptions]);

  return {
    dataVolontaires,
    filtersVolontaires,
    dataInscriptions,
    filtersInscriptions,
    isPending: isPendingVolontaires || isPendingInscriptions || isPending || isPendingQueryInscriptions,
  };
};
