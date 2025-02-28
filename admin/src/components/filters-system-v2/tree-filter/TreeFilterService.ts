import { getFilterArray } from "@/scenes/volontaires/utils";
import { TreeNodeFilterType } from "./TreeFilter";

export interface FilterDefinition {
  title: string;
  name: string;
  parentGroup?: string;
  filterRootFilter: (data?: { key: string }[]) => { key: string }[];
}

export interface ItemWithChildren {
  key: string;
  filters: FilterDefinition[];
  children?: Record<string, ItemWithChildren>;
}

export const mapAvailableFiltersToTreeFilter = (availableItemsFilters: Record<string, { key: string }[]>, itemsWithChildren?: ItemWithChildren): TreeNodeFilterType[] => {
  // Couplage avec l'existant
  const filterArray = getFilterArray({});
  return Object.entries(availableItemsFilters).map(([key, items]) => {
    const label = filterArray.find((filter) => filter?.name === key)?.title || key;

    return createFilterNode(label, key, 0, key === itemsWithChildren?.key ? itemsWithChildren : undefined, items);
  });
};

const createFilterNode = (label: string, value: string, level: number, itemWithChildren?: ItemWithChildren, items?: { key: string }[]): TreeNodeFilterType => {
  const count = items?.length;
  const baseNode: TreeNodeFilterType = {
    checked: false,
    label,
    value,
    count,
    level,
    isLeaf: !itemWithChildren && (!items || items.length === 0),
  };

  if (!itemWithChildren) {
    if (!items?.length) return baseNode;
    return {
      ...baseNode,
      isLeaf: false,
      children: items.map((child) => ({
        checked: false,
        label: child.key,
        value: `${value}-${child.key}`,
        level: level + 1,
        isLeaf: true,
      })),
    };
  }

  const children = itemWithChildren.filters.map((filter) => {
    const subChildren = filter.filterRootFilter(items);
    const subNode = createFilterNode(filter.title, `${value}-${filter.name}`, level + 1, itemWithChildren.children?.[filter.name], subChildren);
    return subNode;
  });

  return { ...baseNode, children };
};
