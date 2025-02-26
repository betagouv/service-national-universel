import React from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";
import cx from "classnames";
import { DecoupledFilterProvider, useDecoupledFilter } from "./DecoupledFilterContext";

interface DecoupledFilterProps {
  filterTree: ItemDecoupledFilterData[];
}

export function RootDecoupledFilter({ filterTree }: DecoupledFilterProps) {
  return (
    <DecoupledFilterProvider filterTree={filterTree}>
      <Popover className="relative flex-row">
        {({ open }) => (
          <>
            <PopoverButton className={`flex items-center gap-2 p-2 ${open ? "bg-gray-100" : ""}`}>Filtres</PopoverButton>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
              show={true}>
              <PopoverPanel className="absolute left-0 z-10 mt-2 w-65 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="flex flex-col gap-1 py-2">
                  {filterTree.map((item) => {
                    return <NextLevelDecoupledFilter key={item.value} item={item} />;
                  })}
                </div>
              </PopoverPanel>
            </Transition>
          </>
        )}
      </Popover>
    </DecoupledFilterProvider>
  );
}

export interface ItemDecoupledFilterData {
  checked: boolean;
  label: string;
  value: string;
  count?: number;
  children?: ItemDecoupledFilterData[];
}

enum ItemState {
  Checked,
  Unchecked,
  Indeterminate,
}

interface NextLevelDecoupledFilterProps {
  item: ItemDecoupledFilterData;
  className?: string;
}

function ItemDecoupledFilter({ item, className }: NextLevelDecoupledFilterProps) {
  const { onCheckboxClick, getItemState, isIndeterminate, getSelectedChildrenCount } = useDecoupledFilter();
  const selectedChildrenCount = getSelectedChildrenCount(item);
  return (
    <div className={cx("flex items-center gap-2 pl-2", className)}>
      <input
        type="checkbox"
        checked={getItemState(item.value)}
        ref={(input) => {
          if (input) {
            input.indeterminate = isIndeterminate(item);
          }
        }}
        onChange={() => onCheckboxClick(item)}
      />

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
}

export function NextLevelDecoupledFilter({ item, className }: NextLevelDecoupledFilterProps) {
  if (!item.children) {
    return <div className={"flex items-center gap-2 p-2"}> {<ItemDecoupledFilter item={item} />}</div>;
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton className={`flex items-center gap-2 p-2 w-full ${open ? "bg-gray-100" : ""}`}>
            <ItemDecoupledFilter item={item} />
          </PopoverButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1">
            <PopoverPanel className="absolute left-full top-0 z-10 ml-2 w-60 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="flex flex-col py-2">{item.children?.map((child) => <NextLevelDecoupledFilter key={child.value} item={{ ...child }} />)}</div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
