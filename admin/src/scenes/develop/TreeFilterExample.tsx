import { buildQuery } from "@/components/filters-system-v2/components/filters/utils";
import useFilterLabels from "@/scenes/volontaires/useFilterLabels";
import { getFilterArray } from "@/scenes/volontaires/utils";
import { getCohortGroups } from "@/services/cohort.service";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSetState } from "react-use";
import ListeDiffusionFilterWrapper from "../planMarketing/campagne/liste-diffusion-temp/ListeDiffusionFilterWrapper";
import Loader from "../../../../packages/ds/src/admin/layout/DataTable/Loader";
import { useListeDiffusion } from "./ListeDiffusionHook";
import { ListeDiffusionFiltres } from "snu-lib";

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

export default function TreeFilterExample() {
  const [selectedFilters, setSelectedFilters] = useState<ListeDiffusionFiltres>({});

  const listeTypeYoung = "young-list";
  const routeVolontaire = "/elasticsearch/young/search?tab=volontaire";

  const listeTypeInscription = "inscription-list";
  const routeInscription = "/elasticsearch/young/search";

  const { data: dataYoung, filters: filtersYoung, isPending: isPendingYoung } = useListeDiffusion(listeTypeYoung, routeVolontaire);
  const { data: dataInscription, filters: filtersInscription, isPending: isPendingInscription } = useListeDiffusion(listeTypeInscription, routeInscription);
  const isPending = isPendingInscription || isPendingYoung;

  if (isPending) return <Loader />;
  // const tempDecoupledFilterData = mapAvailableFiltersToTreeFilter(dataYoung.filters, getCohortGroups());
  return (
    <>
      <ListeDiffusionFilterWrapper
        paramData={dataYoung.params}
        dataFilter={dataYoung.filters}
        filters={filtersYoung}
        id="a"
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
      />

      {/* <TreeFilter treeFilter={tempDecoupledFilterData} id={"a"} /> */}
      {/* <TreeFilter treeFilter={tempDecoupledFilterData} id={"b"} />
      <TreeFilter treeFilter={tempDecoupledFilterData} id={"c"} />
      <TreeFilter treeFilter={tempDecoupledFilterData} id={"d"} /> */}
      {/* <TreeFilterWithoutHeadlessUi treeFilter={tempDecoupledFilterData} id={"a-2"} /> */}
    </>
  );
}
