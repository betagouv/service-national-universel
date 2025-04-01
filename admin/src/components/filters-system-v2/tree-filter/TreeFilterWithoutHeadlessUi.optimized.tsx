import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TreeFilterProps, TreeNodeFilter } from "./TreeFilter.optimized";
import { TreeFilterProvider, useTreeFilter } from "./TreeFilterContext.optimized";
import { BsTrash } from "react-icons/bs";

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  const memoizedHandler = useCallback(handler, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      memoizedHandler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, memoizedHandler]);
};

export const TreeFilterWithoutHeadlessUi = memo(({ id, treeFilter, showSelectedValues, showSelectedValuesCount }: TreeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <TreeFilterProvider flatTree={treeFilter} id={id} showSelectedValuesCount={showSelectedValuesCount}>
      <div className="flex flex-col" ref={ref}>
        <div className="relative flex-row">
          <div className="flex items-center gap-2 p-2">
            <ButtonPrimary onClick={toggleOpen} className="h-[50px] w-[150px]">
              Filtres Optimisés
            </ButtonPrimary>
          </div>
          {isOpen && treeFilter["0"] && (
            <div className="absolute left-0 z-10 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-3 pt-3 text-xs font-light leading-5 text-gray-500">{treeFilter["0"].label}</div>
              <div className="flex flex-col gap-1 py-2">{treeFilter["0"].childIds?.map((childId) => <InnerLevelTreeFilter key={`root-${id}-${childId}`} nodeId={childId} />)}</div>
            </div>
          )}
        </div>
        {showSelectedValues && <SelectedValues />}
      </div>
    </TreeFilterProvider>
  );
});

TreeFilterWithoutHeadlessUi.displayName = "TreeFilterWithoutHeadlessUi";

const InnerLevelTreeFilter = memo(({ nodeId }: { nodeId: string }) => {
  const { id, getNode, deleteNode } = useTreeFilter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const item = getNode(nodeId);

  const filteredIds = useMemo(() => {
    if (!item?.childIds) return [];
    if (!searchTerm) return item.childIds;
    return item.childIds.filter((childId) => {
      const child = getNode(childId);
      return child?.label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [item?.childIds, searchTerm, getNode]);

  const isLeaf = useMemo(() => {
    if (!item?.childIds?.length) return true;
    return item.childIds.every((childId) => {
      const child = getNode(childId);
      return child?.isLeaf;
    });
  }, [item?.childIds, getNode]);

  if (!item) return null;

  if (!item.childIds?.length) {
    return (
      <div className="flex items-center gap-2 p-2 overflow-y-auto hover:bg-gray-100 cursor-pointer">
        <TreeNodeFilter nodeId={nodeId} key={`tnf-no-childIds-${id}-${nodeId}`} />
      </div>
    );
  }

  const toggleOpen = () => setIsOpen(!isOpen);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleTrashClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(nodeId);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex w-full cursor-pointer items-center gap-2 p-2 hover:bg-gray-100" onClick={toggleOpen}>
        <TreeNodeFilter nodeId={nodeId} key={`tnf-${id}-${nodeId}`} />
      </div>
      {isOpen && (
        <div className={`absolute left-full top-0 z-10 ml-2 w-64 max-h-[1500px] ${isLeaf ? "overflow-y-auto" : ""} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5`}>
          <div className="flex content-center gap-2 justify-between px-3 py-2 pt-3 ">
            <div className="text-xs font-light leading-5 text-gray-700 ">{item?.label}</div>
            <BsTrash className="h-4 w-4 text-red-500 hover:text-red-700 cursor-pointer" onClick={handleTrashClick} />
          </div>
          <div className="flex items-center gap-2 pt-2 px-3">
            <input type="text" placeholder={`Recherche ${item?.label}`} className="border border-gray-300 rounded-md px-2 py-1 text-xs w-full" onChange={handleSearchChange} />
          </div>
          <div className="flex flex-col py-2 v-gap-2">{filteredIds?.map((childId) => <InnerLevelTreeFilter key={`itl-${id}-nl-${childId}`} nodeId={childId} />)}</div>
        </div>
      )}
    </div>
  );
});

InnerLevelTreeFilter.displayName = "InnerLevelTreeFilter";

export const SelectedValues = memo(() => {
  const { getSelectedItems } = useTreeFilter();
  const selectedItems = getSelectedItems();

  const entries = Object.entries(selectedItems);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {entries.map(([key, values]) => {
        const displayValues = values.slice(0, 5);
        const hasMore = values.length > 5;

        return (
          <div key={`selected-group-${key}`} className="flex flex-row items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">{key}:</span>
            <div className="flex w-fit flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 py-1.5 pr-1.5 pl-[12px]">
              {displayValues.map((value) => (
                <div key={`selected-value-${key}-${value}`} className="flex w-fit flex-row items-center rounded-md gap-1 bg-gray-200 py-1.5 pr-1.5 pl-[12px]">
                  <div className="text-xs font-medium text-gray-700">{value}</div>
                </div>
              ))}
              {hasMore && (
                <div className="flex w-fit flex-row items-center rounded-md gap-1 bg-gray-200 py-1.5 pr-1.5 pl-[12px]">
                  <div className="text-xs font-medium text-gray-700">...</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

SelectedValues.displayName = "SelectedValues";
