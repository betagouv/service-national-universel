import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { TreeNodeFilterType } from "./TreeFilter.optimized";

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
}

const TreeFilterContext = createContext<TreeFilterContextType | undefined>(undefined);

const createNodeCache = () => {
  const cache = new Map<string, TreeNodeFilterType>();
  return {
    get: (nodeId: string, flatTree: Record<string, TreeNodeFilterType>) => {
      if (!cache.has(nodeId)) {
        cache.set(nodeId, { ...flatTree[nodeId] });
      }
      return cache.get(nodeId);
    },
    clear: () => cache.clear(),
  };
};

const createDescendantCache = () => {
  const cache = new Map<string, string[]>();
  return {
    get: (nodeId: string, getDescendants: (id: string) => string[]) => {
      if (!cache.has(nodeId)) {
        cache.set(nodeId, getDescendants(nodeId));
      }
      return cache.get(nodeId) || [];
    },
    clear: () => cache.clear(),
  };
};

export function TreeFilterProvider({
  children,
  flatTree,
  id,
  showSelectedValues,
  showSelectedValuesCount,
}: {
  children: React.ReactNode;
  flatTree: Record<string, TreeNodeFilterType>;
  id: string;
  showSelectedValues?: boolean;
  showSelectedValuesCount?: boolean;
}) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const nodeCache = useMemo(() => createNodeCache(), []);
  const descendantCache = useMemo(() => createDescendantCache(), []);

  useMemo(() => {
    nodeCache.clear();
    descendantCache.clear();
  }, [flatTree]);

  const getNode = useCallback(
    (nodeId: string): TreeNodeFilterType | undefined => {
      return nodeCache.get(nodeId, flatTree);
    },
    [flatTree],
  );

  const getAllDescendantIds = useCallback(
    (nodeId: string): string[] => {
      const computeDescendants = (id: string): string[] => {
        const node = getNode(id);
        if (!node?.childIds?.length) return [];

        let descendants: string[] = [...node.childIds];
        node.childIds.forEach((childId) => {
          descendants = [...descendants, ...descendantCache.get(childId, computeDescendants)];
        });
        return descendants;
      };

      return descendantCache.get(nodeId, computeDescendants);
    },
    [flatTree, getNode],
  );

  const shouldParentBeChecked = useCallback(
    (nodeId: string): boolean => {
      const node = getNode(nodeId);
      if (!node?.childIds?.length) return false;

      return node.childIds.every((childId) => {
        const descendantIds = [childId, ...getAllDescendantIds(childId)];
        return descendantIds.every((id) => selectedItems.has(id));
      });
    },
    [getNode, getAllDescendantIds, selectedItems],
  );

  const onCheckboxClick = useCallback(
    (nodeId: string) => {
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
        return newSet;
      });
    },
    [getNode, getAllDescendantIds],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
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
    },
    [getNode, getAllDescendantIds],
  );

  const shouldNodeBeChecked = useCallback(
    (nodeId: string): boolean => {
      const node = getNode(nodeId);
      if (!node) return false;
      return selectedItems.has(nodeId) || shouldParentBeChecked(nodeId);
    },
    [getNode, shouldParentBeChecked, selectedItems],
  );

  const getItemState = useCallback(
    (nodeId: string): boolean => {
      return selectedItems.has(nodeId) || shouldParentBeChecked(nodeId) || shouldNodeBeChecked(nodeId);
    },
    [selectedItems, shouldParentBeChecked, shouldNodeBeChecked],
  );

  const isIndeterminate = useCallback(
    (nodeId: string): boolean => {
      const node = getNode(nodeId);
      if (!node?.childIds?.length) return false;

      const descendantIds = getAllDescendantIds(nodeId).filter((id) => id !== nodeId);
      const selectedDescendants = descendantIds.filter((id) => selectedItems.has(id));

      return selectedDescendants.length > 0 && selectedDescendants.length < descendantIds.length;
    },
    [getNode, getAllDescendantIds, selectedItems],
  );

  const getSelectedChildrenCount = useCallback(
    (nodeId: string): number => {
      const node = getNode(nodeId);
      if (!node?.childIds?.length) return 0;

      const leafIds = getAllDescendantIds(nodeId).filter((id) => id !== nodeId);
      return leafIds.filter((id) => selectedItems.has(id)).length;
    },
    [getNode, getAllDescendantIds, selectedItems],
  );

  const getSelectedItems = useCallback((): Record<string, string[]> => {
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
  }, [selectedItems]);

  useMemo(() => {
    const selectedItemsToInit = new Set<string>();

    Object.entries(flatTree).forEach(([id, node]) => {
      if (node.checked) {
        selectedItemsToInit.add(id);
      }
    });

    setSelectedItems(selectedItemsToInit);
  }, [flatTree]);

  const contextValue = useMemo(
    () => ({
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
    }),
    [onCheckboxClick, getItemState, isIndeterminate, getSelectedChildrenCount, id, getSelectedItems, getNode, deleteNode, showSelectedValues, showSelectedValuesCount],
  );

  return <TreeFilterContext.Provider value={contextValue}>{children}</TreeFilterContext.Provider>;
}

export const useTreeFilter = () => {
  const context = useContext(TreeFilterContext);
  if (!context) {
    throw new Error("useTreeFilter must be used within TreeFilterProvider");
  }
  return context;
};
