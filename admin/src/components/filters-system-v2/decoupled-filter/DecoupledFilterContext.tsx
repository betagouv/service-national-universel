import React, { createContext, useContext, useState } from "react";
import { ItemDecoupledFilterData } from "./DecoupledFilter";

interface DecoupledFilterContextType {
  onCheckboxClick: (item: ItemDecoupledFilterData) => void;
  getItemState: (value: string) => boolean;
  isIndeterminate: (item: ItemDecoupledFilterData) => boolean;
  getSelectedChildrenCount: (item: ItemDecoupledFilterData) => number;
  id: string;
}

const DecoupledFilterContext = createContext<DecoupledFilterContextType | undefined>(undefined);

export function DecoupledFilterProvider({ children, filterTree, id }: { children: React.ReactNode; filterTree: ItemDecoupledFilterData[]; id: string }) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const getAllChildrenValues = (item: ItemDecoupledFilterData): string[] => {
    let values: string[] = [];
    if (item.children) {
      item.children.forEach((child) => {
        values = [...values, child.value, ...getAllChildrenValues(child)];
      });
    }
    return values;
  };

  const findParentInTree = (items: ItemDecoupledFilterData[], targetValue: string): ItemDecoupledFilterData | null => {
    for (const item of items) {
      if (item.children?.some((child) => child.value === targetValue)) {
        return item;
      }
      if (item.children) {
        const found = findParentInTree(item.children, targetValue);
        if (found) return found;
      }
    }
    return null;
  };

  const getAncestors = (items: ItemDecoupledFilterData[], targetValue: string): ItemDecoupledFilterData[] => {
    const ancestors: ItemDecoupledFilterData[] = [];
    let currentParent = findParentInTree(items, targetValue);

    while (currentParent) {
      ancestors.push(currentParent);
      currentParent = findParentInTree(items, currentParent.value);
    }

    return ancestors;
  };

  const shouldParentBeChecked = (item: ItemDecoupledFilterData): boolean => {
    if (!item.children) return false;
    return item.children.every((child) => {
      const childValues = [child.value, ...getAllChildrenValues(child)];
      return childValues.every((value) => selectedItems.has(value));
    });
  };

  const onCheckboxClick = (item: ItemDecoupledFilterData) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      const allChildrenValues = getAllChildrenValues(item);
      const ancestors = getAncestors(filterTree, item.value);

      if (newSet.has(item.value)) {
        // Uncheck item and all children
        newSet.delete(item.value);
        allChildrenValues.forEach((value) => newSet.delete(value));
        // Clean up ancestors
        ancestors.forEach((ancestor) => newSet.delete(ancestor.value));
      } else {
        // Check item and all children
        newSet.add(item.value);
        allChildrenValues.forEach((value) => newSet.add(value));
        // Update ancestor selections if needed
        ancestors.forEach((ancestor) => {
          if (shouldParentBeChecked(ancestor)) {
            newSet.add(ancestor.value);
          }
        });
      }

      return newSet;
    });
  };

  const getItemState = (value: string): boolean => {
    return selectedItems.has(value);
  };

  const isIndeterminate = (item: ItemDecoupledFilterData): boolean => {
    if (!item.children) return false;
    const childrenValues = getAllChildrenValues(item).filter((v) => v !== item.value);
    const selectedChildren = childrenValues.filter((value) => selectedItems.has(value));
    return selectedChildren.length > 0 && selectedChildren.length < childrenValues.length;
  };

  const getSelectedChildrenCount = (item: ItemDecoupledFilterData): number => {
    if (!item.children) return 0;
    const childrenValues = getAllChildrenValues(item).filter((v) => v !== item.value);
    return childrenValues.filter((value) => selectedItems.has(value)).length;
  };

  return <DecoupledFilterContext.Provider value={{ onCheckboxClick, getItemState, isIndeterminate, getSelectedChildrenCount, id }}>{children}</DecoupledFilterContext.Provider>;
}

export const useDecoupledFilter = () => {
  const context = useContext(DecoupledFilterContext);
  if (!context) {
    throw new Error("useDecoupledFilter must be used within DecoupledFilterProvider");
  }
  return context;
};
