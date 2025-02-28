import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import React, { useEffect, useRef, useState } from "react";
import { TreeFilterProps, TreeNodeFilter } from "./TreeFilter";
import { TreeFilterProvider, useTreeFilter } from "./TreeFilterContext";

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export function TreeFilterWithoutHeadlessUi({ id, treeFilter }: TreeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  return (
    <TreeFilterProvider flatTree={treeFilter} id={id}>
      <div className="flex flex-col" ref={ref}>
        <div className="relative flex-row">
          <div className="flex items-center gap-2 p-2">
            <ButtonPrimary onClick={() => setIsOpen(!isOpen)} className="h-[50px] w-[150px]">
              Filtres sans headlessui
            </ButtonPrimary>
          </div>
          {isOpen && (
            <div className="absolute left-0 z-10 mt-2 w-65 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-3 pt-3 text-xs font-light leading-5 text-gray-500">{treeFilter["0"].label}</div>
              <div className="flex flex-col gap-1 py-2">{treeFilter["0"].childIds?.map((childId) => <InnerLevelTreeFilter key={`${id}-${childId}`} nodeId={childId} />)}</div>
            </div>
          )}
        </div>
        <SelectedValues />
      </div>
    </TreeFilterProvider>
  );
}

function InnerLevelTreeFilter({ nodeId }: { nodeId: string; className?: string }) {
  const { id, getNode } = useTreeFilter();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  const item = getNode(nodeId);
  if (!item) return null;

  if (!item.childIds?.length) {
    return (
      <div className="flex items-center cursor-pointer gap-2 p-2 overflow-y-auto">
        <TreeNodeFilter nodeId={nodeId} />
      </div>
    );
  }

  // const overflow = item.childIds.length === 0 ? "overflow-y-auto" : "";
  const isLeaf = item.childIds?.every((childId) => {
    const child = getNode(childId);
    return child?.isLeaf;
  });

  return (
    <div className="relative" ref={ref}>
      <div className={`flex w-full cursor-pointer items-center gap-2 p-2 ${isOpen ? "bg-gray-100" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        <TreeNodeFilter nodeId={nodeId} />
      </div>
      {isOpen && (
        <div className={`absolute left-full top-0 z-10 ml-2 w-60 max-h-[500px] ${isLeaf ? "overflow-y-auto" : ""} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5`}>
          <div className="px-3 pt-3 text-xs font-light leading-5 text-gray-700">{item?.label}</div>
          <div className="flex flex-col py-2 v-gap-2">{item.childIds?.map((childId) => <InnerLevelTreeFilter key={`next-level-${id}-${childId}`} nodeId={childId} />)}</div>
        </div>
      )}
    </div>
  );
}

const SelectedValues = () => {
  const { getSelectedItems } = useTreeFilter();
  const selectedItems = Array.from(getSelectedItems());

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {selectedItems.map((value) => (
        <div key={`selected-values-${value}`} className="flex w-fit flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 py-1.5 pr-1.5 pl-[12px]">
          <div className="text-xs font-medium text-gray-700">{value}</div>
        </div>
      ))}
    </div>
  );
};
