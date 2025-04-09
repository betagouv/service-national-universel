import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import React, { useRef, useState } from "react";
import { InnerLevelTreeFilter } from "./InnerLevelTreeFilter";
import { SelectedValues } from "./SelectedValues";
import { TreeFilterProvider } from "./TreeFilterContext";
import { TreeNodeFilterType } from "./TreeNodeFilter";
import { useClickOutside } from "./hooks/useClickOutside";

export interface TreeFilterProps {
  id: string;
  treeFilter: Record<string, TreeNodeFilterType>;
  showSelectedValues?: boolean;
  showSelectedValuesCount?: boolean;
}

export function TreeFilter({ id, treeFilter, showSelectedValues, showSelectedValuesCount }: TreeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  return (
    <TreeFilterProvider flatTree={treeFilter} id={id} showSelectedValuesCount={showSelectedValuesCount}>
      <div className="flex flex-col" ref={ref}>
        <div className="relative flex-row">
          <div className="flex items-center gap-2 p-2">
            <ButtonPrimary onClick={() => setIsOpen(!isOpen)} className="h-[50px] w-[150px]">
              Filtres
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
}
