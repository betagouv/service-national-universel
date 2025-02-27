import React, { useState } from "react";
import cx from "classnames";
import { TreeFilterProvider, useTreeFilter } from "./TreeFilterContext";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { TreeFilterProps, TreeNodeFilterProps } from "./TreeFilter";

export function TreeFilterWithoutHeadlessUi({ id, treeFilter }: TreeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TreeFilterProvider treeFilter={treeFilter} id={id}>
      <div className="relative flex-row">
        <div className={`flex items-center gap-2 p-2 ${isOpen ? "bg-gray-100" : ""}`}>
          <ButtonPrimary onClick={() => setIsOpen(!isOpen)} className="h-[50px] w-[150px]">
            Filtres sans headless ui
          </ButtonPrimary>
        </div>
        {isOpen && (
          <div className="absolute left-0 z-10 mt-2 w-65 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="flex flex-col gap-1 py-2">
              {treeFilter.map((item) => (
                <NextLevelTreeFilter key={`${id}-${item.value}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </TreeFilterProvider>
  );
}

const TreeNodeFilter = React.memo(
  function ItemDecoupledFilter({ item, className }: TreeNodeFilterProps) {
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

function NextLevelTreeFilter({ item, className }: TreeNodeFilterProps) {
  const { id } = useTreeFilter();
  const [isOpen, setIsOpen] = useState(false);

  if (!item.children) {
    return <div className={"flex items-center gap-2 p-2"}>{<TreeNodeFilter item={item} />}</div>;
  }

  return (
    <div key={`popover-${id}-${item.value}`} className="relative">
      <div className={`flex items-center gap-2 p-2 w-full cursor-pointer ${isOpen ? "bg-gray-100" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        <TreeNodeFilter item={item} />
      </div>
      {isOpen && (
        <div className="absolute left-full top-0 z-10 ml-2 w-60 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="flex flex-col py-2">{item.children?.map((child) => <NextLevelTreeFilter key={`next-level-${id}-${child.value}`} item={{ ...child }} />)}</div>
        </div>
      )}
    </div>
  );
}
