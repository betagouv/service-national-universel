import { getFilterArray } from "@/scenes/volontaires/utils";
import { TreeNodeFilterType } from "./TreeNodeFilter";

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

export const mapAvailableFiltersToTreeFilter = (
  availableItemsFilters: Record<string, { key: string }[]>,
  itemsWithChildren?: ItemWithChildren,
): Record<string, TreeNodeFilterType> => {
  const filterArray = getFilterArray({});
  const flatTree: Record<string, TreeNodeFilterType> = {};

  // Initialize root node
  flatTree["0"] = {
    checked: false,
    label: "Général",
    value: "root",
    isLeaf: false,
    childIds: [],
    isRoot: true,
    groupKey: "root",
  };

  const createNode = (label: string, value: string, level: number, groupKey: string, itemWithChildren?: ItemWithChildren, items?: { key: string }[], parentId?: string): string => {
    const nodeId = `${groupKey}-${value}`;

    flatTree[nodeId] = {
      checked: false,
      label,
      value,
      isLeaf: !itemWithChildren && (!items || items.length === 0),
      parentId,
      childIds: [],
      isRoot: level === 0,
      groupKey: groupKey,
    };

    if (!itemWithChildren) {
      if (!items?.length) return nodeId;

      const childIds = items.map((child) => {
        const childId = `${groupKey}-${child.key}`;
        flatTree[childId] = {
          checked: false,
          label: child.key,
          value: child.key,
          isLeaf: true,
          parentId: nodeId,
          isRoot: false,
          groupKey: groupKey,
        };
        return childId;
      });

      flatTree[nodeId].childIds = childIds;
      return nodeId;
    }

    const childIds = itemWithChildren.filters.map((filter) => {
      const subChildren = filter.filterRootFilter(items);
      return createNode(filter.title, filter.name, level + 1, groupKey, itemWithChildren.children?.[filter.name], subChildren, nodeId);
    });

    flatTree[nodeId].childIds = childIds;
    return nodeId;
  };

  // Create top-level nodes and collect their IDs
  const topLevelIds = Object.entries(availableItemsFilters).map(([key, items]) => {
    const label = filterArray.find((filter) => filter?.name === key)?.title || key;
    return createNode(label, key, 0, key, key === itemsWithChildren?.key ? itemsWithChildren : undefined, items, "0");
  });

  // Assign children to root node
  flatTree["0"].childIds = topLevelIds;

  return flatTree;
};
