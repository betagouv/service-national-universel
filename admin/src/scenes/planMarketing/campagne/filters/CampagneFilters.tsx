import React, { useMemo, useState } from "react";
import { CampagneFiltersBase } from "./CampagneFiltersHook";
import { TreeFilter } from "@/components/filters-system-v2/tree-filter/TreeFilter";
import { TreeNodeFilterType } from "@/components/filters-system-v2/tree-filter/TreeNodeFilter";

export interface CampagneGeneriqueFilters extends CampagneFiltersBase {}

export interface CampagneSpecifiqueFilters extends CampagneFiltersBase {
  hasGenericLink?: boolean;
}

export interface CampagneFiltersProps<T extends CampagneFiltersBase> {
  onChange: (filters: T) => void;
  additionalFilters?: React.ReactNode;
  initialFilters?: Partial<T>;
  isSpecificCampaign?: boolean;
}

function CampagneFilters<T extends CampagneFiltersBase>(props: CampagneFiltersProps<T> & { filters: T }) {
  const { onChange, additionalFilters, filters, isSpecificCampaign = false } = props;

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(Object.keys(filters)));

  const handleSelectionChange = (newSelectedItems: Set<string>) => {
    setSelectedItems(new Set(newSelectedItems));
    const newFilters: CampagneFiltersBase = {};

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

    if (isSpecificCampaign) {
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

  const filtersTree = useMemo<Record<string, TreeNodeFilterType>>(
    () => ({
      "0": {
        label: "Filtres",
        value: "filtres-root",
        isLeaf: false,
        isRoot: true,
        childIds: ["campagnes", "programmations", ...(isSpecificCampaign ? ["liaison"] : [])],
        groupKey: "filtres",
      },
      campagnes: {
        label: "Campagnes",
        value: "campagnes",
        isLeaf: false,
        isRoot: false,
        parentId: "0",
        childIds: ["campagnes-actives", "campagnes-inactives"],
        groupKey: "filtres",
      },
      programmations: {
        label: "Programmations",
        value: "programmations",
        isLeaf: false,
        isRoot: false,
        parentId: "0",
        childIds: ["programmations-actives", "programmations-inactives"],
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
      ...(isSpecificCampaign
        ? {
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
          }
        : {}),
    }),
    [selectedItems, isSpecificCampaign],
  );

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

export default CampagneFilters;
