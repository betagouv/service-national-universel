import React, { createContext, useContext, useState } from "react";
import { TreeNodeFilterType } from "./TreeFilter";

interface TreeFilterContextType {
  onCheckboxClick: (item: TreeNodeFilterType) => void;
  getItemState: (value: string) => boolean;
  isIndeterminate: (item: TreeNodeFilterType) => boolean;
  getSelectedChildrenCount: (item: TreeNodeFilterType) => number;
  id: string;
  getSelectedItems: () => Set<string>;
}

const TreeFilterContext = createContext<TreeFilterContextType | undefined>(undefined);

export function TreeFilterProvider({ children, treeFilter, id }: { children: React.ReactNode; treeFilter: TreeNodeFilterType[]; id: string }) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const getAllChildrenValues = (item: TreeNodeFilterType): string[] => {
    let values: string[] = [];
    if (item.children) {
      item.children.forEach((child) => {
        values = [...values, child.value, ...getAllChildrenValues(child)];
      });
    }
    return values;
  };

  const findParentInTree = (items: TreeNodeFilterType[], targetValue: string): TreeNodeFilterType | null => {
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

  const getAncestors = (items: TreeNodeFilterType[], targetValue: string): TreeNodeFilterType[] => {
    const ancestors: TreeNodeFilterType[] = [];
    let currentParent = findParentInTree(items, targetValue);

    while (currentParent) {
      ancestors.push(currentParent);
      currentParent = findParentInTree(items, currentParent.value);
    }

    return ancestors;
  };

  const shouldParentBeChecked = (item: TreeNodeFilterType): boolean => {
    if (!item.children) return false;
    return item.children.every((child) => {
      const childValues = [child.value, ...getAllChildrenValues(child)];
      return childValues.every((value) => selectedItems.has(value));
    });
  };

  const onCheckboxClick = (item: TreeNodeFilterType) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      const allChildrenValues = getAllChildrenValues(item);
      const ancestors = getAncestors(treeFilter, item.value);
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
          } else {
            newSet.delete(ancestor.value);
          }
        });
      }

      return newSet;
    });
  };

  const getItemState = (value: string): boolean => {
    return selectedItems.has(value);
  };

  const isIndeterminate = (item: TreeNodeFilterType): boolean => {
    if (!item.children) return false;
    const childrenValues = getAllChildrenValues(item).filter((v) => v !== item.value);
    const selectedChildren = childrenValues.filter((value) => selectedItems.has(value));
    return selectedChildren.length > 0 && selectedChildren.length < childrenValues.length;
  };

  const getLeafValues = (item: TreeNodeFilterType): string[] => {
    let values: string[] = [];
    if (!item.children) {
      return [item.value];
    }
    item.children.forEach((child) => {
      values = [...values, ...getLeafValues(child)];
    });
    return values;
  };

  const getSelectedChildrenCount = (item: TreeNodeFilterType): number => {
    if (!item.children) return 0;
    const leafValues = getLeafValues(item).filter((v) => v !== item.value);
    return leafValues.filter((value) => selectedItems.has(value)).length;
  };

  const getSelectedItems = (): Set<string> => {
    return selectedItems;
  };

  return (
    <TreeFilterContext.Provider value={{ onCheckboxClick, getItemState, isIndeterminate, getSelectedChildrenCount, id, getSelectedItems }}>{children}</TreeFilterContext.Provider>
  );
}

export const useTreeFilter = () => {
  const context = useContext(TreeFilterContext);
  if (!context) {
    throw new Error("useDecoupledFilter must be used within DecoupledFilterProvider");
  }
  return context;
};
