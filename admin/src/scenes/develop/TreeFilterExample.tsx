import { mapAvailableFiltersToTreeFilter } from "@/components/filters-system-v2/tree-filter/TreeFilterService";
import { TreeFilterWithoutHeadlessUi } from "@/components/filters-system-v2/tree-filter/TreeFilterWithoutHeadlessUi";
import { getCohortGroups } from "@/services/cohort.service";
import React from "react";
import Loader from "../../../../packages/ds/src/admin/layout/DataTable/Loader";
import { useListeDiffusionFilters } from "../planMarketing/listeDiffusion/filters/ListeDiffusionFiltersHook";

export type TempFilters = Record<string, { key: string }[]>;
export default function TreeFilterExample() {
  const { dataVolontaires, filtersVolontaires, dataInscriptions, filtersInscriptions, isPending } = useListeDiffusionFilters();

  if (isPending) return <Loader />;
  const tempDecoupledFilterData = mapAvailableFiltersToTreeFilter(dataVolontaires.filters, getCohortGroups());
  return (
    <>
      {/* <ListeDiffusionFilterWrapper paramData={dataYoung.params} dataFilter={dataYoung.filters} filters={filtersYoung} id="a" savedFilter={savedFilterExample} />
      <ListeDiffusionFilterWrapper paramData={dataYoung.params} dataFilter={dataYoung.filters} filters={filtersYoung} id="b" />
      <ListeDiffusionFilterWrapper
        paramData={dataInscription.params}
        dataFilter={dataInscription.filters}
        filters={filtersInscription}
        id="c"
        savedFilter={{ region: ["Auvergne-Rhône-Alpes"] }}
      /> */}
      {/* <TreeFilter treeFilter={tempDecoupledFilterData} id={"a"} /> */}
      {/* <TreeFilter treeFilter={tempDecoupledFilterData} id={"b"} />
      <TreeFilter treeFilter={tempDecoupledFilterData} id={"c"} />
      <TreeFilter treeFilter={tempDecoupledFilterData} id={"d"} /> */}
      <TreeFilterWithoutHeadlessUi treeFilter={tempDecoupledFilterData} id={"a-2"} />
    </>
  );
}
