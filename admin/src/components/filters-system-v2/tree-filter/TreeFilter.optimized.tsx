import React, { memo } from "react";
import cx from "classnames";
import { useTreeFilter } from "./TreeFilterContext.optimized";

export interface TreeFilterProps {
  id: string;
  treeFilter: Record<string, TreeNodeFilterType>;
  showSelectedValues?: boolean;
  showSelectedValuesCount?: boolean;
}

export interface TreeNodeFilterType {
  checked?: boolean;
  label: string;
  value: string;
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

export const TreeNodeFilter = memo(({ nodeId }: { nodeId: string }) => {
  const { onCheckboxClick, getItemState, isIndeterminate, getSelectedChildrenCount, id, getNode, showSelectedValuesCount } = useTreeFilter();
  const item = getNode(nodeId);
  if (!item) return null;

  const selectedChildrenCount = getSelectedChildrenCount(nodeId);
  return (
    <div
      className="w-full h-full"
      onClick={(e) => {
        if (item.isLeaf) {
          onCheckboxClick(nodeId);
        }
      }}>
      <div className={cx("flex items-center gap-2 pl-2 full-width")}>
        {!item.isRoot && (
          <input
            className="hover:cursor-pointer"
            key={`input-${id}-${item.value}`}
            type="checkbox"
            checked={getItemState(nodeId)}
            ref={(input) => {
              if (input) {
                input.indeterminate = isIndeterminate(nodeId);
              }
            }}
            onChange={() => {
              if (!item.isLeaf) {
                onCheckboxClick(nodeId);
              }
            }}
          />
        )}

        <div className="flex items-center gap-2">
          <span>{item.label}</span>
          {showSelectedValuesCount && !!selectedChildrenCount && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-normal text-blue-600">{selectedChildrenCount}</div>
          )}
        </div>

        {item.childIds && item.childIds.length > 0 && <span className="absolute right-4">{">"}</span>}
      </div>
    </div>
  );
});

TreeNodeFilter.displayName = "TreeNodeFilter";
