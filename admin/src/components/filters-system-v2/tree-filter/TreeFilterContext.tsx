import React, { createContext, useContext, useMemo, useState } from "react";
import { TreeNodeFilterType } from "./TreeNodeFilter";

interface TreeFilterContextType {
  onCheckboxClick: (nodeId: string) => void;
  getItemState: (nodeId: string) => boolean;
  isIndeterminate: (nodeId: string) => boolean;
  getSelectedChildrenCount: (nodeId: string) => number;
  id: string;
  getSelectedItems: () => Record<string, string[]>;
  getNode: (nodeId: string) => TreeNodeFilterType | undefined;
  deleteNode: (nodeId: string) => void;
  showSelectedValues?: boolean;
  showSelectedValuesCount?: boolean;
  onUserSelectionChange?: (selectedItems: Set<string>) => void;
}

const TreeFilterContext = createContext<TreeFilterContextType | undefined>(undefined);

export function TreeFilterProvider({
  children,
  flatTree,
  id,
  showSelectedValues,
  showSelectedValuesCount,
  onUserSelectionChange,
}: {
  children: React.ReactNode;
  flatTree: Record<string, TreeNodeFilterType>;
  id: string;
  showSelectedValues?: boolean;
  showSelectedValuesCount?: boolean;
  onUserSelectionChange?: (selectedItems: Set<string>) => void;
}) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const getNode = (nodeId: string): TreeNodeFilterType | undefined => {
    return { ...flatTree[nodeId] };
  };

  const getAllDescendantIds = (nodeId: string): string[] => {
    const node = getNode(nodeId);
    if (!node?.childIds?.length) return [];

    let descendants: string[] = [...node.childIds];
    node.childIds.forEach((childId) => {
      descendants = [...descendants, ...getAllDescendantIds(childId)];
    });
    return descendants;
  };

  const shouldParentBeChecked = (nodeId: string): boolean => {
    const node = getNode(nodeId);
    if (!node?.childIds?.length) return false;
    return node.childIds.every((childId) => {
      const descendantIds = [childId, ...getAllDescendantIds(childId)];
      return descendantIds.every((id) => selectedItems.has(id));
    });
  };

  const onCheckboxClick = (nodeId: string) => {
    const node = getNode(nodeId);
    if (!node) return;
    const descendantIds = getAllDescendantIds(nodeId);
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (node.isLeaf && newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else if (node.isLeaf && !newSet.has(nodeId)) {
        newSet.add(nodeId);
      }

      if (!node.isLeaf) {
        const haveChildrenSelected = descendantIds.some((id) => newSet.has(id));
        if (haveChildrenSelected) {
          descendantIds.forEach((id) => newSet.delete(id));
        } else {
          descendantIds.forEach((id) => newSet.add(id));
        }
      }
      if (onUserSelectionChange) {
        onUserSelectionChange(newSet);
      }
      return newSet;
    });
  };

  const deleteNode = (nodeId: string) => {
    const node = getNode(nodeId);
    if (!node) return;
    const descendantIds = getAllDescendantIds(nodeId);
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (!node.isLeaf) {
        const haveChildrenSelected = descendantIds.some((id) => newSet.has(id));
        if (haveChildrenSelected) {
          descendantIds.forEach((id) => newSet.delete(id));
        }
      }
      return newSet;
    });
  };

  const shouldNodeBeChecked = (nodeId: string): boolean => {
    const node = getNode(nodeId);
    if (!node) return false;
    return selectedItems.has(nodeId) || shouldParentBeChecked(nodeId);
  };

  const getItemState = (nodeId: string): boolean => {
    return selectedItems.has(nodeId) || shouldParentBeChecked(nodeId) || shouldNodeBeChecked(nodeId);
  };

  const isIndeterminate = (nodeId: string): boolean => {
    const node = getNode(nodeId);
    if (!node?.childIds?.length) return false;
    const descendantIds = getAllDescendantIds(nodeId).filter((id) => id !== nodeId);
    const selectedDescendants = descendantIds.filter((id) => selectedItems.has(id));
    return selectedDescendants.length > 0 && selectedDescendants.length < descendantIds.length;
  };

  const getSelectedChildrenCount = (nodeId: string): number => {
    const node = getNode(nodeId);
    if (!node?.childIds?.length) return 0;
    const leafIds = getAllDescendantIds(nodeId).filter((id) => id !== nodeId);
    return leafIds.filter((id) => selectedItems.has(id)).length;
  };

  const getSelectedItems = (): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    selectedItems.forEach((item) => {
      const [key, ...value] = item.split("-");
      if (!result[key]) {
        result[key] = [];
      }
      if (value.length > 0) {
        result[key].push(value.join("-"));
      }
    });
    return result;
  };

  const initSelectedItems = () => {
    const selectedItemsToInit = new Set<string>();
    Object.entries(flatTree).forEach(([id, node]) => {
      if (node.checked) {
        selectedItemsToInit.add(id);
      }
    });
    setSelectedItems(selectedItemsToInit);
  };

  useMemo(() => {
    initSelectedItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatTree]);

  // useEffect(() => {
  //   if (onSelectionChange) {
  //     onSelectionChange(selectedItems);
  //   }
  // }, [selectedItems, onSelectionChange]);

  return (
    <TreeFilterContext.Provider
      value={{
        onCheckboxClick,
        getItemState,
        isIndeterminate,
        getSelectedChildrenCount,
        id,
        getSelectedItems,
        getNode,
        deleteNode,
        showSelectedValues,
        showSelectedValuesCount,
        onUserSelectionChange,
      }}>
      {children}
    </TreeFilterContext.Provider>
  );
}

export const useTreeFilter = () => {
  const context = useContext(TreeFilterContext);
  if (!context) {
    throw new Error("useTreeFilter must be used within TreeFilterProvider");
  }
  return context;
};
