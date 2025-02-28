import React from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import cx from "classnames";
import { TreeFilterProvider, useTreeFilter } from "./TreeFilterContext";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";

export interface TreeFilterProps {
  id: string;
  treeFilter: Record<string, TreeNodeFilterType>;
}

export interface TreeNodeFilterType {
  id: string;
  checked: boolean;
  label: string;
  value: string;
  level: number;
  count?: number;
  childIds?: string[];
  parentId?: string;
  isLeaf: boolean;
  isRoot: boolean;
  groupKey: string;
}

export interface TreeNodeFilterProps {
  item: TreeNodeFilterType;
  className?: string;
}

export const SelectedValues = () => {
  const { getSelectedItems } = useTreeFilter();
  const selectedItems = Array.from(getSelectedItems());
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {selectedItems.map((value) => (
        <div key={`selected-values-${value}`} className="flex w-fit flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 py-1.5 pr-1.5 pl-[12px]">
          <div className="text-xs font-medium text-gray-700">{value}</div>
          {/* {values.map((value) => (
            <div key={value} className="rounded bg-gray-100 py-1 px-2 text-xs text-gray-500">
              {value}
            </div>
          ))} */}
        </div>
      ))}
    </div>
  );
};

export function TreeFilter({ id, treeFilter }: TreeFilterProps) {
  return (
    <TreeFilterProvider flatTree={treeFilter} id={id}>
      <div className="flex flex-col">
        <Popover key={`popover-${id}`} className="relative flex-row">
          {({ open }) => (
            <>
              <PopoverButton className={`flex items-center gap-2 p-2 ${open ? "bg-gray-100" : ""}`}>
                <ButtonPrimary onClick={() => open} className="h-[50px] w-[150px]">
                  Filtres
                </ButtonPrimary>
              </PopoverButton>
              <Transition
                key={`transition-${id}`}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
                show={open}>
                <PopoverPanel key={`popover-panel-${id}`} className="absolute left-0 z-10 mt-2 w-65  rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-3 pt-3 text-xs font-light leading-5 text-gray-500">{treeFilter["0"].label}</div>
                  <div className="flex flex-col gap-1 py-2">{treeFilter["0"].childIds?.map((childId) => <InnerLevelTreeFilter key={`${id}-${childId}`} nodeId={childId} />)}</div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
        <SelectedValues />
      </div>
    </TreeFilterProvider>
  );
}

function InnerLevelTreeFilter({ nodeId }: { nodeId: string; className?: string }) {
  const { id, getNode } = useTreeFilter();
  const item = getNode(nodeId);
  if (!item) return null;

  if (!item.childIds?.length) {
    return (
      <div className={"flex items-center gap-2 p-2"}>
        <TreeNodeFilter nodeId={nodeId} />
      </div>
    );
  }

  return (
    <Popover key={`next-level-popover-${id}-${item.value}`} className="relative">
      {({ open }) => (
        <>
          <PopoverButton key={`next-level-popover-button-${id}-${item.value}`} className={`flex items-center gap-2 p-2 w-full ${open ? "bg-gray-100" : ""}`}>
            <TreeNodeFilter nodeId={nodeId} />
          </PopoverButton>
          <Transition
            key={`next-level-popover-transition-${id}-${item.value}`}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1">
            <PopoverPanel
              key={`next-level-popover-panel-${id}-${item.value}`}
              className="absolute left-full top-0 z-10 ml-2 w-60 max-h-[500px] overflow-scroll rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-3 pt-3 text-xs font-light leading-5 text-gray-500">{item?.label}</div>
              <div className="flex flex-col py-2">{item.childIds?.map((childId) => <InnerLevelTreeFilter key={`next-level-${id}-${childId}`} nodeId={childId} />)}</div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

export const TreeNodeFilter = React.memo(
  function TreeNodeFilter({ nodeId }: { nodeId: string }) {
    const { onCheckboxClick, getItemState, isIndeterminate, getSelectedChildrenCount, id, getNode } = useTreeFilter();
    const item = getNode(nodeId);
    if (!item) return null;

    const selectedChildrenCount = getSelectedChildrenCount(nodeId);
    return (
      <div className={cx("flex items-center gap-2 pl-2 ")}>
        {!item.isRoot && (
          <input
            // className="hover:cursor-pointer"
            key={`input-${id}-${item.value}`}
            type="checkbox"
            checked={getItemState(item.id)}
            ref={(input) => {
              if (input) {
                input.indeterminate = isIndeterminate(item.id);
              }
            }}
            onChange={() => onCheckboxClick(item.id)}
          />
        )}

        <div className="flex items-center gap-2">
          <span>{item.label}</span>
          {item.count && <span>({item.count})</span>}
          {!!selectedChildrenCount && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-normal text-blue-600">{selectedChildrenCount}</div>
          )}
        </div>

        {item.childIds && <span className="absolute right-4">{">"}</span>}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.nodeId === nextProps.nodeId;
  },
);
