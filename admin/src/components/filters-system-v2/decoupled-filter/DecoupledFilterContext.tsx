import React, { createContext, useContext, useState } from "react";
import { ItemDecoupledFilterData } from "./DecoupledFilter";

interface DecoupledFilterContextType {
  onCheckboxClick: (item: ItemDecoupledFilterData) => void;
  getItemState: (value: string) => boolean;
  isIndeterminate: (item: ItemDecoupledFilterData) => boolean;
}

const DecoupledFilterContext = createContext<DecoupledFilterContextType | undefined>(undefined);

export function DecoupledFilterProvider({ children, initialData }: { children: React.ReactNode; initialData: ItemDecoupledFilterData[] }) {
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

  const getParentLineage = (item: ItemDecoupledFilterData): string[] => {
    let values: string[] = [];
    if (item.parent) {
      values = [item.parent.value, ...getParentLineage(item.parent)];
    }
    return values;
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
      const parentLineage = getParentLineage(item);

      if (newSet.has(item.value)) {
        // Uncheck item and all children
        newSet.delete(item.value);
        allChildrenValues.forEach((value) => newSet.delete(value));
        // Clean up parents if needed
        parentLineage.forEach((parentValue) => newSet.delete(parentValue));
      } else {
        // Check item and all children
        newSet.add(item.value);
        allChildrenValues.forEach((value) => newSet.add(value));
        // Check parents if all their children are checked
        if (item.parent) {
          parentLineage.forEach((parentValue) => {
            const parent = findItemByValue(initialData, parentValue);
            if (parent && shouldParentBeChecked(parent)) {
              newSet.add(parentValue);
            }
          });
        }
      }

      return newSet;
    });
  };

  const findItemByValue = (items: ItemDecoupledFilterData[], value: string): ItemDecoupledFilterData | null => {
    for (const item of items) {
      if (item.value === value) return item;
      if (item.children) {
        const found = findItemByValue(item.children, value);
        if (found) return found;
      }
    }
    return null;
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

  return <DecoupledFilterContext.Provider value={{ onCheckboxClick, getItemState, isIndeterminate }}>{children}</DecoupledFilterContext.Provider>;
}

export const useDecoupledFilter = () => {
  const context = useContext(DecoupledFilterContext);
  if (!context) {
    throw new Error("useDecoupledFilter must be used within DecoupledFilterProvider");
  }
  return context;
};
