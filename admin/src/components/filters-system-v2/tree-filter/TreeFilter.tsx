import React from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import cx from "classnames";
import { TreeFilterProvider, useTreeFilter } from "./TreeFilterContext";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";

export interface TreeFilterProps {
  id: string;
  treeFilter: TreeNodeFilterType[];
}

const SelectedValues = () => {
  const { getSelectedItems } = useTreeFilter();
  const selectedItems = Array.from(getSelectedItems());
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {selectedItems.map((value) => (
        <div key={`selected-values-${value}`} className="flex w-fit flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 py-1.5 pr-1.5 pl-[12px]">
          <div className="text-xs font-medium text-gray-700">{value} jh kh</div>
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

export const TreeFilter = React.memo(
  function TreeFilter({ id, treeFilter }: TreeFilterProps) {
    return (
      <TreeFilterProvider treeFilter={treeFilter} id={id}>
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
                  <PopoverPanel key={`popover-panel-${id}`} className="absolute left-0 z-10 mt-2 w-65 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="px-3 pt-3 text-xs font-light leading-5 text-gray-500">Général</div>
                    <div className="flex flex-col gap-1 py-2">
                      {treeFilter.map((item) => {
                        return <NextLevelTreeFilter key={`${id}-${item.value}`} item={item} />;
                      })}
                    </div>
                  </PopoverPanel>
                </Transition>
              </>
            )}
          </Popover>
          <SelectedValues />
        </div>
      </TreeFilterProvider>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.treeFilter?.length === nextProps.treeFilter?.length;
    // return false;
  },
);

export interface TreeNodeFilterType {
  checked: boolean;
  label: string;
  value: string;
  level: number;
  count?: number;
  children?: TreeNodeFilterType[];
  parent?: TreeNodeFilterType;
  isLeaf: boolean;
}

export interface TreeNodeFilterProps {
  item: TreeNodeFilterType;
  className?: string;
}

const TreeNodeFilter = React.memo(
  function TreeNodeFilter({ item, className }: TreeNodeFilterProps) {
    const { onCheckboxClick, getItemState, isIndeterminate, getSelectedChildrenCount, id } = useTreeFilter();

    const selectedChildrenCount = getSelectedChildrenCount(item);
    return (
      <div className={cx("flex items-center gap-2 pl-2", className)}>
        {item.level !== 0 && (
          <input
            key={`input-${id}-${item.value}`}
            type="checkbox"
            checked={getItemState(item.value)}
            ref={(input) => {
              if (input) {
                input.indeterminate = isIndeterminate(item);
              }
            }}
            onChange={() => onCheckboxClick(item)}
          />
        )}

        <div className="flex items-center gap-2">
          <span>{item.label}</span>
          {item.count && <span>({item.count})</span>}
          {!!selectedChildrenCount && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-normal text-blue-600">{selectedChildrenCount}</div>
          )}
        </div>

        {item.children && <span className="absolute right-4">{">"}</span>}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // return prevProps.item.checked === nextProps.item.checked && prevProps.item.count === nextProps.item.count;
    return false;
  },
);

const NextLevelTreeFilter = React.memo(
  function NextLevelTreeFilter({ item, className }: TreeNodeFilterProps) {
    const { id } = useTreeFilter();

    if (!item.children) {
      return <div className={"flex items-center gap-2 p-2"}> {<TreeNodeFilter item={item} />}</div>;
    }
    return (
      <Popover key={`next-level-popover-${id}-${item.value}`} className="relative">
        {({ open }) => (
          <>
            <PopoverButton key={`next-level-popover-button-${id}-${item.value}`} className={`flex items-center gap-2 p-2 w-full ${open ? "bg-gray-100" : ""}`}>
              <TreeNodeFilter item={item} />
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
                className="absolute left-full top-0 z-10 ml-2 w-60 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="px-3 pt-3 text-xs font-light leading-5 text-gray-500">{item?.label}</div>
                <div className="flex flex-col py-2">{item.children?.map((child) => <NextLevelTreeFilter key={`next-level-${id}-${child.value}`} item={{ ...child }} />)}</div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    );
  },
  (prevProps, nextProps) => {
    // return prevProps.item.checked === nextProps.item.checked && prevProps.item.count === nextProps.item.count;
    return false;
  },
);
