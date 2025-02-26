import { getFilterArray } from "@/scenes/volontaires/utils";
import { ItemDecoupledFilterData } from "./DecoupledFilter";

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

export const mapAvailableFiltersToTreeFilter = (availableItemsFilters: Record<string, { key: string }[]>, itemsWithChildren?: ItemWithChildren): ItemDecoupledFilterData[] => {
  const filterArray = getFilterArray({});
  return Object.entries(availableItemsFilters).map(([key, items]) => {
    const label = filterArray.find((filter) => filter?.name === key)?.title || key;

    return createFilterNode(label, key, items.length, key === itemsWithChildren?.key ? itemsWithChildren : undefined, items);
  });
};

const createFilterNode = (label: string, value: string, count?: number, itemWithChildren?: ItemWithChildren, items?: { key: string }[]): ItemDecoupledFilterData => {
  const baseNode: ItemDecoupledFilterData = {
    checked: false,
    label,
    value,
    count,
  };

  if (!itemWithChildren) {
    if (!items?.length) return baseNode;
    return {
      ...baseNode,
      children: items.map((child) => ({
        checked: false,
        label: child.key,
        value: `${value}-${child.key}`,
      })),
    };
  }

  const children = itemWithChildren.filters.map((filter) => {
    const subChildren = filter.filterRootFilter(items);
    const subNode = createFilterNode(filter.title, `${value}-${filter.name}`, undefined, itemWithChildren.children?.[filter.name], subChildren);
    return subNode;
  });

  return { ...baseNode, children };
};
