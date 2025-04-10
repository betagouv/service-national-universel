import React from "react";
import { useTreeFilter } from "./TreeFilterContext";

export const SelectedValues = () => {
  const { getSelectedItems } = useTreeFilter();
  const selectedItems = getSelectedItems();

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {Object.entries(selectedItems).map(([key, values]) => {
        const displayValues = values.slice(0, 5);
        const hasMore = values.length > 5;

        return (
          <div key={`selected-group-${key}`} className="flex flex-row items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">{key}:</span>
            <div className="flex w-fit flex-row items-center gap-1 rounded-md border-[1px] border-gray-200 py-1.5 pr-1.5 pl-[12px]">
              {displayValues.map((value) => (
                <div key={`selected-value-${key}-${value}`} className="flex w-fit flex-row items-center rounded-md gap-1 bg-gray-200 py-1.5 pr-1.5 pl-[12px]">
                  <div className="text-xs font-medium text-gray-700  ">{value}</div>
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
};
