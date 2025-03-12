import { mapAvailableFiltersToTreeFilter } from "@/components/filters-system-v2/tree-filter/TreeFilterService";
import { TreeFilterWithoutHeadlessUi } from "@/components/filters-system-v2/tree-filter/TreeFilterWithoutHeadlessUi";
import { getCohortGroups } from "@/services/cohort.service";
import React from "react";
import { useListeDiffusionFilters } from "../planMarketing/listeDiffusion/filters/ListeDiffusionFiltersHook";
import Loader from "@/components/Loader";
import { TreeNodeFilterType } from "@/components/filters-system-v2/tree-filter/TreeFilter";

export type TempFilters = Record<string, { key: string }[]>;
export default function TreeFilterExample() {
  const { dataVolontaires, filtersVolontaires, dataInscriptions, filtersInscriptions, isPending } = useListeDiffusionFilters({ addCohortFilter: true });

  if (isPending) return <Loader />;
  const tempDecoupledFilterData = mapAvailableFiltersToTreeFilter(dataVolontaires.filters, getCohortGroups());
  const simpleTreeFilterValues: Record<string, TreeNodeFilterType> = {
    "0": {
      label: "Filtres",
      value: "root",
      childIds: ["statut", "campagne_liee"],
      isLeaf: false,
      isRoot: true,
      groupKey: "root",
    },
    statut: {
      label: "Statut",
      value: "statut",
      childIds: ["statut-en_cours", "statut-valide"],
      parentId: "0",
      isLeaf: false,
      isRoot: true,
      groupKey: "statut",
    },
    "statut-en_cours": {
      checked: true,
      label: "En cours",
      value: "en_cours",
      parentId: "1",
      isLeaf: true,
      isRoot: false,
      groupKey: "statut",
    },
    "statut-valide": {
      checked: false,
      label: "Validé",
      value: "valide",
      parentId: "1",
      isLeaf: true,
      isRoot: false,
      groupKey: "statut",
    },
    campagne_liee: {
      checked: false,
      label: "Campagne générique liée",
      value: "campagne_liee",
      childIds: ["campagne_liee-oui", "campagne_liee-non"],
      parentId: "0",
      isLeaf: false,
      isRoot: true,
      groupKey: "campagne_liee",
    },
    "campagne_liee-oui": {
      label: "Oui",
      value: "oui",
      parentId: "4",
      isLeaf: true,
      isRoot: false,
      groupKey: "campagne_liee",
    },
    "campagne_liee-non": {
      label: "Non",
      value: "non",
      parentId: "4",
      isLeaf: true,
      isRoot: false,
      groupKey: "campagne_liee",
    },
  };

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
      <TreeFilterWithoutHeadlessUi treeFilter={tempDecoupledFilterData} id={"a-1"} showSelectedValues={true} showSelectedValuesCount={true} />
      <TreeFilterWithoutHeadlessUi treeFilter={simpleTreeFilterValues} id={"pref-2"} showSelectedValues={true} showSelectedValuesCount={true} />
      <TreeFilterWithoutHeadlessUi treeFilter={simpleTreeFilterValues} id={"pref-3"} />
    </>
  );
}
