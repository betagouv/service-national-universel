import React, { useMemo, useState } from "react";

import { TreeFilter } from "@/components/filters-system-v2/tree-filter/TreeFilter";
import { TreeNodeFilterType } from "@/components/filters-system-v2/tree-filter/TreeNodeFilter";
import { PlanMarketingFiltersBase } from "./PlanMarketingFiltersHook";

export interface CampagneGeneriqueFilters extends PlanMarketingFiltersBase {}

export interface CampagneSpecifiqueFilters extends PlanMarketingFiltersBase {
  hasGenericLink?: boolean;
}

export interface ListeDiffusionFilters extends PlanMarketingFiltersBase {
  isArchived?: boolean;
}

export type CampagneFilterType = "generique" | "specifique" | "liste-diffusion";

export interface CampagneFiltersProps<T extends PlanMarketingFiltersBase> {
  onChange: (filters: T) => void;
  additionalFilters?: React.ReactNode;
  initialFilters?: Partial<T>;
  filterType: CampagneFilterType;
}

function getCampagnesNodes(selectedItems: Set<string>, filterType: CampagneFilterType): Record<string, TreeNodeFilterType> {
  return {
    campagnes: {
      label: filterType === "liste-diffusion" ? "Listes de diffusion" : "Campagnes",
      value: "campagnes",
      isLeaf: false,
      isRoot: false,
      parentId: "0",
      childIds: ["campagnes-actives", "campagnes-inactives"],
      groupKey: "filtres",
    },
    "campagnes-actives": {
      label: "Actives",
      value: "campagnes-actives",
      isLeaf: true,
      isRoot: false,
      parentId: "campagnes",
      groupKey: "campagnes-statut",
      checked: selectedItems.has("campagnes-actives"),
    },
    "campagnes-inactives": {
      label: "Archivées",
      value: "campagnes-inactives",
      isLeaf: true,
      isRoot: false,
      parentId: "campagnes",
      groupKey: "campagnes-statut",
      checked: selectedItems.has("campagnes-inactives"),
    },
  };
}

function getProgrammationsNodes(selectedItems: Set<string>): Record<string, TreeNodeFilterType> {
  return {
    programmations: {
      label: "Programmations",
      value: "programmations",
      isLeaf: false,
      isRoot: false,
      parentId: "0",
      childIds: ["programmations-actives", "programmations-inactives"],
      groupKey: "filtres",
    },
    "programmations-actives": {
      label: "Actives",
      value: "programmations-actives",
      isLeaf: true,
      isRoot: false,
      parentId: "programmations",
      groupKey: "programmations-statut",
      checked: selectedItems.has("programmations-actives"),
    },
    "programmations-inactives": {
      label: "Inactives",
      value: "programmations-inactives",
      isLeaf: true,
      isRoot: false,
      parentId: "programmations",
      groupKey: "programmations-statut",
      checked: selectedItems.has("programmations-inactives"),
    },
  };
}

function getLiaisonNodes(selectedItems: Set<string>): Record<string, TreeNodeFilterType> {
  return {
    liaison: {
      label: "Rattaché à une campagne générique",
      value: "liaison",
      isLeaf: false,
      isRoot: false,
      parentId: "0",
      childIds: ["liaison-oui", "liaison-non"],
      groupKey: "filtres",
    },
    "liaison-oui": {
      label: "Oui",
      value: "liaison-oui",
      isLeaf: true,
      isRoot: false,
      parentId: "liaison",
      groupKey: "liaison-type",
      checked: selectedItems.has("liaison-oui"),
    },
    "liaison-non": {
      label: "Non",
      value: "liaison-non",
      isLeaf: true,
      isRoot: false,
      parentId: "liaison",
      groupKey: "liaison-type",
      checked: selectedItems.has("liaison-non"),
    },
  };
}

function PlanMarketingFilters<T extends PlanMarketingFiltersBase>(props: CampagneFiltersProps<T> & { filters: T }) {
  const { onChange, additionalFilters, filters, filterType } = props;

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(Object.keys(filters)));

  const handleSelectionChange = (newSelectedItems: Set<string>) => {
    setSelectedItems(new Set(newSelectedItems));
    const newFilters: PlanMarketingFiltersBase = {};

    const campagnesActives = newSelectedItems.has("campagnes-actives");
    const campagnesInactives = newSelectedItems.has("campagnes-inactives");
    if (campagnesActives && !campagnesInactives) {
      newFilters.isArchived = false;
    } else if (!campagnesActives && campagnesInactives) {
      newFilters.isArchived = true;
    } else if (!campagnesActives && !campagnesInactives) {
      newFilters.isArchived = undefined;
    }

    const progActives = newSelectedItems.has("programmations-actives");
    const progInactives = newSelectedItems.has("programmations-inactives");
    if (progActives && !progInactives) {
      newFilters.isProgrammationActive = true;
    } else if (!progActives && progInactives) {
      newFilters.isProgrammationActive = false;
    } else if (!progActives && !progInactives) {
      newFilters.isProgrammationActive = undefined;
    }

    if (filterType === "specifique") {
      const liaisonOui = newSelectedItems.has("liaison-oui");
      const liaisonNon = newSelectedItems.has("liaison-non");
      if (liaisonOui && !liaisonNon) {
        (newFilters as CampagneSpecifiqueFilters).hasGenericLink = true;
      } else if (!liaisonOui && liaisonNon) {
        (newFilters as CampagneSpecifiqueFilters).hasGenericLink = false;
      } else {
        (newFilters as CampagneSpecifiqueFilters).hasGenericLink = undefined;
      }
    }
    onChange(newFilters as T);
  };

  const filtersTree = useMemo<Record<string, TreeNodeFilterType>>(() => {
    const nodes: Record<string, TreeNodeFilterType> = {
      "0": {
        label: "Filtres",
        value: "filtres-root",
        isLeaf: false,
        isRoot: true,
        childIds: ["campagnes", ...(filterType !== "liste-diffusion" ? ["programmations"] : []), ...(filterType === "specifique" ? ["liaison"] : [])],
        groupKey: "filtres",
      },
      ...getCampagnesNodes(selectedItems, filterType),
    };

    if (filterType !== "liste-diffusion") {
      Object.assign(nodes, getProgrammationsNodes(selectedItems));
    }
    if (filterType === "specifique") {
      Object.assign(nodes, getLiaisonNodes(selectedItems));
    }
    return nodes;
  }, [selectedItems, filterType]);

  return (
    <div className="flex items-center gap-4 rounded-lg">
      <TreeFilter
        id="campagne-filters"
        treeFilter={filtersTree}
        showSelectedValues={false}
        showSelectedValuesCount={false}
        showSearchBar={false}
        onSelectionChange={handleSelectionChange}
      />
      {additionalFilters}
    </div>
  );
}

export default PlanMarketingFilters;
